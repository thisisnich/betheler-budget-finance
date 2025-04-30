import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { getAuthUser } from '../modules/auth/getAuthUser';
import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    ...SessionIdArg,
    amount: v.number(),
    category: v.optional(v.string()),
    datetime: v.string(),
    description: v.string(),
    transactionType: v.union(v.literal('expense'), v.literal('income'), v.literal('savings')),
  },
  handler: async (ctx, args) => {
    //ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // For income, ensure amount is positive; for expenses, ensure amount is negative
    // For savings, allow both positive (adding to savings) and negative (withdrawing from savings)
    let adjustedAmount = args.amount;
    if (args.transactionType === 'expense' && adjustedAmount > 0) {
      adjustedAmount = -adjustedAmount; // Make expense amounts negative
    } else if (args.transactionType === 'income' && adjustedAmount < 0) {
      adjustedAmount = Math.abs(adjustedAmount); // Make income amounts positive
    }
    // Note: Savings amounts can be either positive (adding to savings) or negative (withdrawing from savings)

    // Set default category based on transaction type
    let category = args.category || '';
    if (args.transactionType === 'income' && !category) {
      category = 'Income';
    } else if (args.transactionType === 'savings' && !category) {
      category = 'Savings';
    }

    // Create the transaction
    const transactionId = await ctx.db.insert('transactions', {
      userId: user._id,
      amount: adjustedAmount,
      category,
      datetime: args.datetime,
      description: args.description,
      transactionType: args.transactionType,
    });

    return transactionId;
  },
});

export const listForPastMonth = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Calculate date from one month ago
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // Format as ISO string for comparison (matching datetime format in schema)
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    // Get transactions for this user from the past month
    // Using the by_userId_datetime index
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) =>
        q.eq('userId', user._id).gte('datetime', oneMonthAgoStr)
      )
      .order('desc')
      .collect();

    return transactions;
  },
});

export const remove = mutation({
  args: {
    ...SessionIdArg,
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Fetch the transaction to verify ownership
    const transaction = await ctx.db.get(args.transactionId);

    // Verify the transaction exists and belongs to the user
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId !== user._id) {
      throw new Error('Not authorized to delete this transaction');
    }

    // Delete the transaction
    await ctx.db.delete(args.transactionId);

    return true;
  },
});

export const listByMonth = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
    transactionType: v.union(
      v.literal('expense'),
      v.literal('income'),
      v.literal('savings'),
      v.literal('all')
    ),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999); // Last millisecond of the day
    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get transactions for this user within the specified month
    // Using the by_userId_datetime index
    let transactionsQuery = ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) =>
        q.eq('userId', user._id).gte('datetime', startDateStr).lte('datetime', endDateStr)
      );

    // Apply transaction type filter only if not 'all'
    if (args.transactionType !== 'all') {
      transactionsQuery = transactionsQuery.filter((q) =>
        q.eq(q.field('transactionType'), args.transactionType)
      );
    }

    const transactions = await transactionsQuery.order('desc').collect();

    return transactions;
  },
});

// Add a function to get category summaries for the month
export const getCategorySummary = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
    transactionType: v.union(v.literal('expense'), v.literal('income'), v.literal('savings')),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999); // Last millisecond of the day

    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get transactions for this user within the specified month
    // Using the by_userId_datetime index
    let transactionsQuery = ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) =>
        q.eq('userId', user._id).gte('datetime', startDateStr).lte('datetime', endDateStr)
      );

    // Apply transaction type filter
    transactionsQuery = transactionsQuery.filter((q) =>
      q.eq(q.field('transactionType'), args.transactionType)
    );

    const transactions = await transactionsQuery.collect();

    // Calculate totals by category
    const categorySummary: Record<string, { amount: number; count: number }> = {};
    let totalSpent = 0;

    for (const transaction of transactions) {
      const category = transaction.category || 'Uncategorized';

      if (!categorySummary[category]) {
        categorySummary[category] = { amount: 0, count: 0 };
      }

      categorySummary[category].amount += Math.abs(transaction.amount);
      categorySummary[category].count += 1;
      totalSpent += Math.abs(transaction.amount);
    }

    // Calculate percentages and prepare final result
    const result = Object.entries(categorySummary).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalSpent !== 0 ? (data.amount / totalSpent) * 100 : 0,
    }));

    return {
      categories: result,
      totalSpent,
    };
  },
});

// Add getSavingsSummary query
export const getSavingsSummary = query({
  args: {
    ...SessionIdArg,
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Start with user's transactions
    let transactionsQuery = ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('transactionType'), 'savings'));

    // Apply month/year filter if specified
    if (args.year !== undefined && args.month !== undefined) {
      // Create start and end date for the specified month
      const startDate = new Date(args.year, args.month, 1);
      const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999); // Last millisecond of the day

      // Format as ISO strings for comparison
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Filter by date range
      transactionsQuery = transactionsQuery.filter((q) =>
        q.and(q.gte(q.field('datetime'), startDateStr), q.lte(q.field('datetime'), endDateStr))
      );
    }

    const transactions = await transactionsQuery.collect();

    // Calculate totals
    let totalSaved = 0;
    let totalWithdrawn = 0;

    for (const transaction of transactions) {
      if (transaction.amount > 0) {
        totalSaved += transaction.amount;
      } else {
        totalWithdrawn += Math.abs(transaction.amount);
      }
    }

    const netSavings = totalSaved - totalWithdrawn;

    return {
      totalSaved,
      totalWithdrawn,
      netSavings,
      count: transactions.length,
    };
  },
});

// Get a comprehensive monthly financial summary with income, expenses, budgeted amounts, and savings
export const getMonthlyFinancialSummary = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    totalSpendableIncome: number;
    remainder: number;
    status: 'balanced' | 'unbudgeted' | 'overbudgeted';
    formattedMonth: string;
  }> => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999); // Last millisecond of the day
    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get all transactions for this user within the specified month
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) =>
        q.eq('userId', user._id).gte('datetime', startDateStr).lte('datetime', endDateStr)
      )
      .collect();

    // Get budget data from budget service
    const budgetData: {
      totalBudget: number;
      totalSpent: number;
      totalRemaining: number;
      percentSpent: number;
      budgetCount: number;
      status: string;
    } = await ctx.runQuery(api.budgets.getTotalBudgetSummary, {
      sessionId: args.sessionId,
      year: args.year,
      month: args.month,
    });

    // Calculate totals by transaction type
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavingsDeposits = 0;
    let totalSavingsWithdrawals = 0;

    for (const transaction of transactions) {
      const amount = Math.abs(transaction.amount);

      switch (transaction.transactionType) {
        case 'income':
          totalIncome += amount;
          break;
        case 'expense':
          totalExpenses += amount;
          break;
        case 'savings':
          // Handle savings deposits (positive amounts) and withdrawals (negative amounts) separately
          if (transaction.amount > 0) {
            totalSavingsDeposits += transaction.amount;
          } else {
            totalSavingsWithdrawals += Math.abs(transaction.amount);
          }
          break;
      }
    }

    // Calculate net savings (deposits minus withdrawals)
    const totalSavings = totalSavingsDeposits - totalSavingsWithdrawals;

    // Calculate total spendable income (income minus savings)
    const totalSpendableIncome = totalIncome - totalSavings;

    // Calculate the remainder (spendable income minus expenses)
    const remainder = totalSpendableIncome - totalExpenses;

    // Determine the status of the remainder
    let status: 'balanced' | 'unbudgeted' | 'overbudgeted' = 'balanced';
    if (remainder > 0) {
      status = 'unbudgeted'; // Positive remainder means unbudgeted money
    } else if (remainder < 0) {
      status = 'overbudgeted'; // Negative remainder means overbudgeting
    }

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      totalSpendableIncome,
      remainder,
      status,
      formattedMonth: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
  },
});

// Migration function to update any transactions without transactionType
export const migrateTransactionTypes = mutation({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get all transactions for this user that don't have a transactionType
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) => q.eq('userId', user._id))
      .collect();

    let updatedCount = 0;

    for (const transaction of transactions) {
      // If transaction doesn't have a transactionType or it's undefined
      if (transaction.transactionType === undefined) {
        let transactionType: 'expense' | 'income' | 'savings';

        // Determine type based on amount and category
        if (transaction.amount < 0) {
          transactionType = 'expense';
        } else if (transaction.category?.toLowerCase() === 'savings') {
          transactionType = 'savings';
        } else {
          transactionType = 'income';
        }

        // Update the transaction
        await ctx.db.patch(transaction._id, {
          transactionType,
        });

        updatedCount++;
      }
    }

    return { updatedCount };
  },
});

// Get transaction counts for all users in a specific month/year for leaderboard
export const getUserTransactionLeaderboard = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999); // Last millisecond of the day
    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get all users
    const users = await ctx.db.query('users').collect();

    // For each user, get their transaction count for the month
    const leaderboardData = await Promise.all(
      users.map(async (userData) => {
        // Count transactions for this user within the specified month
        const transactions = await ctx.db
          .query('transactions')
          .withIndex('by_userId_datetime', (q) =>
            q.eq('userId', userData._id).gte('datetime', startDateStr).lte('datetime', endDateStr)
          )
          .collect();

        return {
          userId: userData._id,
          name: userData.name,
          transactionCount: transactions.length,
        };
      })
    );

    // Sort by transaction count (highest first)
    return leaderboardData.sort((a, b) => b.transactionCount - a.transactionCount);
  },
});

// Public leaderboard endpoint that doesn't require authentication
export const getPublicLeaderboard = query({
  args: {
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
  },
  handler: async (ctx, args) => {
    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59, 999); // Last millisecond of the day

    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get all users
    const users = await ctx.db.query('users').collect();

    // For each user, get their transaction count for the month
    const leaderboardData = await Promise.all(
      users.map(async (userData) => {
        // Count transactions for this user within the specified month
        const transactions = await ctx.db
          .query('transactions')
          .withIndex('by_userId_datetime', (q) =>
            q.eq('userId', userData._id).gte('datetime', startDateStr).lte('datetime', endDateStr)
          )
          .collect();

        return {
          userId: userData._id,
          name: userData.name,
          transactionCount: transactions.length,
        };
      })
    );

    // Sort by transaction count (highest first)
    return leaderboardData.sort((a, b) => b.transactionCount - a.transactionCount);
  },
});
