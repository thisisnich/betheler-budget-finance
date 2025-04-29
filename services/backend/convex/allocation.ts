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
    value: v.number(),
    priority: v.number(),
  },
  handler: async (ctx, { sessionId, category, type, value, priority }) => {
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
    const allocationData = { userId: user._id, category, type, value, priority };

    if (existing) {
      await ctx.db.patch(existing._id, allocationData);
    } else {
      await ctx.db.insert('allocations', allocationData);
    }
  },
});

// Mutation: Delete an allocation by category for the authenticated user
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

    // Sort allocations by priority (higher priority first, undefined last)
    const sortedAllocations = allocations.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Initialize the result object and remaining income
    const result: Record<string, number> = {};
    let remainingIncome = income;

    // Process each allocation
    for (const allocation of sortedAllocations) {
      const { category, type, value } = allocation;

      if (type === 'amount') {
        // Deduct a fixed amount
        result[category] = value;
        remainingIncome -= value;
      } else if (type === 'percentage') {
        // Deduct a percentage of the total income
        const percentageValue = (value / 100) * income;
        result[category] = percentageValue;
        remainingIncome -= percentageValue;
      } else if (type === 'overflow') {
        // Deduct any remaining income
        if (remainingIncome > 0) {
          const overflowValue = Math.min(remainingIncome, value);
          result[category] = overflowValue;
          remainingIncome -= overflowValue;
        }
      }

      // Stop processing if there's no income left
      if (remainingIncome <= 0) {
        break;
      }
    }

    // Optionally, log or update the database with the result
    // Example: Save the split result to a "logs" collection
    // If you don't want to log, simply skip this step.
    // You can remove or comment out the logging code.

    return result; // Return the split amounts by category
  },
});
