import { SessionIdArg } from "convex-helpers/server/sessions";
import { mutation, query } from "./_generated/server";
import { getAuthUser } from "../modules/auth/getAuthUser";
import { v } from "convex/values";

export const create = mutation({
  args: {
    ...SessionIdArg,
    amount: v.number(),
    category: v.string(),
    datetime: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    //ensure user is authenticated
    const user = await getAuthUser(ctx, args); 
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Create the transaction
    const transactionId = await ctx.db.insert("transactions", {
      userId: user._id,
      amount: args.amount,
      category: args.category,
      datetime: args.datetime,
      description: args.description,
    });

    return transactionId;
  }
});

export const listForPastMonth = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error("Unauthorized");
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
      .query("transactions")
      .withIndex("by_userId_datetime", (q) => 
        q.eq("userId", user._id).gte("datetime", oneMonthAgoStr)
      )
      .order("desc")
      .collect();
    
    return transactions;
  }
});

export const remove = mutation({
  args: {
    ...SessionIdArg,
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Fetch the transaction to verify ownership
    const transaction = await ctx.db.get(args.transactionId);
    
    // Verify the transaction exists and belongs to the user
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    if (transaction.userId !== user._id) {
      throw new Error("Not authorized to delete this transaction");
    }
    
    // Delete the transaction
    await ctx.db.delete(args.transactionId);
    
    return true;
  }
});

export const listByMonth = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0); // Last day of month
    
    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Get transactions for this user within the specified month
    // Using the by_userId_datetime index
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_datetime", (q) => 
        q.eq("userId", user._id)
         .gte("datetime", startDateStr)
         .lte("datetime", endDateStr)
      )
      .order("desc")
      .collect();
    
    return transactions;
  }
});

// Add a function to get category summaries for the month
export const getCategorySummary = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(), // 0-based (January is 0)
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Create start and end date for the specified month
    const startDate = new Date(args.year, args.month, 1);
    const endDate = new Date(args.year, args.month + 1, 0); // Last day of month
    
    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Get transactions for this user within the specified month
    // Using the by_userId_datetime index
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_datetime", (q) => 
        q.eq("userId", user._id)
         .gte("datetime", startDateStr)
         .lte("datetime", endDateStr)
      )
      .collect();
    
    // Calculate totals by category
    const categorySummary: Record<string, { amount: number, count: number }> = {};
    let totalSpent = 0;
    
    transactions.forEach(transaction => {
      const category = transaction.category || "Uncategorized";
      
      if (!categorySummary[category]) {
        categorySummary[category] = { amount: 0, count: 0 };
      }
      
      categorySummary[category].amount += transaction.amount;
      categorySummary[category].count += 1;
      totalSpent += transaction.amount;
    });
    
    // Calculate percentages and prepare final result
    const result = Object.entries(categorySummary).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalSpent !== 0 ? (data.amount / totalSpent) * 100 : 0
    }));
    
    return {
      categories: result,
      totalSpent
    };
  }
});