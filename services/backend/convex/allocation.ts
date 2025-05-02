import { SessionIdArg } from 'convex-helpers/server/sessions'; // Import SessionIdArg
import { v } from 'convex/values';
import { getAuthUser } from '../modules/auth/getAuthUser'; // Import helper for user authentication
import { mutation, query } from './_generated/server';

// Define the type for allocation
interface Allocation {
  userId: string; // Add userId to associate allocations with a user
  category: string;
  type: 'amount' | 'percentage' | 'overflow';
  value: number;
  priority?: number; // Optional for overflow types
}

// Query: Fetch all allocations for the authenticated user
export const getAllocations = query({
  args: {
    ...SessionIdArg, // Include sessionId in the arguments
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args); // Ensure user is authenticated
    if (!user) {
      throw new Error('Unauthorized');
    }

    return await ctx.db
      .query('allocations')
      .filter((q) => q.eq(q.field('userId'), user._id)) // Filter by userId
      .collect();
  },
});

// Mutation: Upsert (create or update) an allocation
export const upsertAllocation = mutation({
  args: {
    ...SessionIdArg, // Include sessionId in the arguments
    category: v.string(),
    type: v.union(v.literal('amount'), v.literal('percentage'), v.literal('overflow')),
    value: v.float64(),
    priority: v.float64(),
    alwaysAdd: v.optional(v.boolean()), // Ensure this field is included
  },
  handler: async (ctx, { sessionId, category, type, value, priority, alwaysAdd }) => {
    const user = await getAuthUser(ctx, { sessionId }); // Ensure user is authenticated
    if (!user) {
      throw new Error('Unauthorized');
    }

    const existing = await ctx.db
      .query('allocations')
      .filter((q) =>
        q.and(
          q.eq(q.field('userId'), user._id), // Match userId
          q.eq(q.field('category'), category)
        )
      )
      .first();

    // Only use the required fields
    const allocationData = { userId: user._id, category, type, value, priority, alwaysAdd };

    if (existing) {
      await ctx.db.patch(existing._id, allocationData);
    } else {
      await ctx.db.insert('allocations', allocationData);
    }
  },
}); // Mutation: Delete an allocation by category for the authenticated user
export const deleteAllocation = mutation({
  args: {
    ...SessionIdArg, // Include sessionId in the arguments
    category: v.string(),
  },
  handler: async (ctx, { sessionId, category }) => {
    const user = await getAuthUser(ctx, { sessionId }); // Ensure user is authenticated
    if (!user) {
      throw new Error('Unauthorized');
    }

    const existing = await ctx.db
      .query('allocations')
      .filter((q) =>
        q.and(
          q.eq(q.field('userId'), user._id), // Match userId
          q.eq(q.field('category'), category)
        )
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const splitIncomeByAllocations = mutation({
  args: {
    ...SessionIdArg, // Include sessionId in the arguments
    income: v.number(),
  },
  handler: async (ctx, { sessionId, income }) => {
    const user = await getAuthUser(ctx, { sessionId }); // Ensure user is authenticated
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Fetch all allocations for the user
    const allocations = await ctx.db
      .query('allocations')
      .filter((q) => q.eq(q.field('userId'), user._id)) // Filter by userId
      .collect();

    // Fetch current budgets for the user for the current month and year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const budgets = await ctx.db
      .query('budgets')
      .withIndex('by_userId_yearMonth', (q) =>
        q.eq('userId', user._id).eq('year', currentYear).eq('month', currentMonth)
      )
      .collect();

    // Create a map of current budgets for quick lookup
    const budgetMap = budgets.reduce(
      (map, budget) => {
        map[budget.category] = budget.amount;
        return map;
      },
      {} as Record<string, number>
    );

    // Sort allocations by priority (higher priority first, undefined last)
    const sortedAllocations = allocations.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Calculate total percentage for overflow allocations
    const overflowAllocations = sortedAllocations.filter(
      (allocation) => allocation.type === 'overflow'
    );

    // Initialize the result object and remaining income
    const result: Record<string, number> = {};
    let remainingIncome = income;

    // Process fixed amounts and percentages first
    for (const allocation of sortedAllocations) {
      const { category, type, value } = allocation;

      if (type === 'amount') {
        const currentBudget = budgetMap[category] || 0;

        if (allocation.alwaysAdd) {
          // Always add the fixed amount to the budget
          const amountToAllocate = Math.min(value, remainingIncome);
          result[category] = (result[category] || 0) + amountToAllocate;
          remainingIncome -= amountToAllocate;
        } else {
          // Only allocate if the current budget is less than the fixed amount
          if (currentBudget < value) {
            const amountToAllocate = Math.min(value - currentBudget, remainingIncome);
            result[category] = amountToAllocate;
            remainingIncome -= amountToAllocate;
          }
        }
      } else if (type === 'percentage') {
        // Deduct a percentage of the total income
        const percentageValue = (value / 100) * income;
        const allocatedAmount = Math.min(percentageValue, remainingIncome); // Ensure we don't allocate more than remaining income
        result[category] = allocatedAmount;
        remainingIncome -= allocatedAmount;
      }

      // Stop processing if there's no income left
      if (remainingIncome <= 0) {
        break;
      }
    }

    // Process overflow allocations based on their individual percentages
    if (remainingIncome > 0) {
      for (const allocation of overflowAllocations) {
        const { category, value } = allocation;

        // Allocate only the specified percentage of the remaining income
        const allocatedAmount = (value / 100) * remainingIncome;
        result[category] = (result[category] || 0) + allocatedAmount;

        // Deduct the allocated amount from the remaining income
        remainingIncome -= allocatedAmount;

        // Stop processing if there's no income left
        if (remainingIncome <= 0) {
          break;
        }
      }
    }

    return result; // Return the split amounts by category
  },
});
