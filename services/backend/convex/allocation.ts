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
