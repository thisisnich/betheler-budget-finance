import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Define the type for allocation
interface Allocation {
  category: string;
  type: 'amount' | 'percentage' | 'overflow';
  value: number;
  priority?: number; // Optional for overflow types
}

// Query: Fetch all allocations
export const getAllocations = query(async ({ db }) => {
  return await db.query('allocations').collect();
});

// Mutation: Upsert (create or update) an allocation
export const upsertAllocation = mutation({
  args: v.object({
    category: v.string(),
    type: v.union(v.literal('amount'), v.literal('percentage'), v.literal('overflow')),
    value: v.number(),
    priority: v.number(),
  }),
  handler: async ({ db }, { category, type, value, priority }) => {
    const existing = await db
      .query('allocations')
      .filter((q) => q.eq(q.field('category'), category))
      .first();

    // Only use the required fields
    const allocationData = { category, type, value, priority };

    if (existing) {
      await db.patch(existing._id, allocationData);
    } else {
      await db.insert('allocations', allocationData);
    }
  },
});

// Mutation: Delete an allocation by category
export const deleteAllocation = mutation({
  args: v.object({
    category: v.string(),
  }),
  handler: async ({ db }, { category }) => {
    const existing = await db
      .query('allocations')
      .filter((q) => q.eq(q.field('category'), category))
      .first();

    if (existing) {
      await db.delete(existing._id);
    }
  },
});
