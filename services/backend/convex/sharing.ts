import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { getAuthUser } from '../modules/auth/getAuthUser';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Generate a random share ID
function generateShareId(): string {
  return Math.random().toString(36).substring(2, 14);
}

// Create a share link for transactions and category summary
export const createShareLink = mutation({
  args: {
    ...SessionIdArg,
    year: v.number(),
    month: v.number(),
    expirationDays: v.optional(v.number()), // null or undefined means no expiration
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Generate a unique share ID
    const shareId = generateShareId();

    // Current timestamp
    const now = Date.now();

    // Handle expiration - if expirationDays is null or undefined, create a permanent link
    let expiresAt: number | null = null;
    let expiresAtLabel: string | null = null;

    if (args.expirationDays !== null && args.expirationDays !== undefined) {
      expiresAt = now + args.expirationDays * 24 * 60 * 60 * 1000;
      expiresAtLabel = new Date(expiresAt).toISOString();
    }

    // Create the share link record
    const shareLinkId = await ctx.db.insert('shareLinks', {
      userId: user._id,
      shareId,
      year: args.year,
      month: args.month,
      createdAt: now,
      // If expiresAt is null, the link does not expire
      expiresAt: expiresAt ?? Number.MAX_SAFE_INTEGER,
      // Store null to indicate no expiration, or the expiry date
      expiresAtLabel: expiresAtLabel ?? 'Never',
    });

    return {
      shareId,
      shareLinkId,
      expiresAt: expiresAt ?? null,
      expiresAtLabel: expiresAtLabel ?? 'Never',
      createdAt: now,
    };
  },
});

// List all share links for the current user
export const listUserShares = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get all share links for the user
    const shareLinks = await ctx.db
      .query('shareLinks')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    // Filter out expired links
    const now = Date.now();
    const validShareLinks = shareLinks.filter((link) => link.expiresAt > now);

    return validShareLinks.map((link) => {
      // For display, calculate a formatted month/year
      const monthDate = new Date(link.year, link.month);
      const formattedPeriod = monthDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      return {
        ...link,
        formattedPeriod,
        formattedCreatedAt: new Date(link.createdAt).toLocaleString(),
        permanent: link.expiresAtLabel === 'Never',
      };
    });
  },
});

// Delete a share link
export const deleteShareLink = mutation({
  args: {
    ...SessionIdArg,
    shareLinkId: v.id('shareLinks'),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get the share link
    const shareLink = await ctx.db.get(args.shareLinkId);
    if (!shareLink) {
      throw new Error('Share link not found');
    }

    // Ensure the user owns the share link
    if (shareLink.userId !== user._id) {
      throw new Error('Not authorized to delete this share link');
    }

    // Delete the share link
    await ctx.db.delete(args.shareLinkId);

    return { success: true };
  },
});

// Delete all share links for a user
export const deleteAllShareLinks = mutation({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get all share links for the user
    const shareLinks = await ctx.db
      .query('shareLinks')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    // Delete each share link
    for (const shareLink of shareLinks) {
      await ctx.db.delete(shareLink._id);
    }

    return {
      success: true,
      count: shareLinks.length,
    };
  },
});

// Get a share link by ID
export const getShareLink = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the share link
    const shareLink = await ctx.db
      .query('shareLinks')
      .withIndex('by_shareId', (q) => q.eq('shareId', args.shareId))
      .first();

    if (!shareLink) {
      return null;
    }

    // Check if the share link has expired (if it has an expiration)
    if (shareLink.expiresAt < Date.now() && shareLink.expiresAtLabel !== 'Never') {
      return null;
    }

    return shareLink;
  },
});

// Get shared transactions for a specific share link
export const getSharedTransactions = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the share link
    const shareLink = await ctx.db
      .query('shareLinks')
      .withIndex('by_shareId', (q) => q.eq('shareId', args.shareId))
      .first();

    if (!shareLink) {
      return null;
    }

    // Check if the share link has expired (if it has an expiration)
    if (shareLink.expiresAt < Date.now() && shareLink.expiresAtLabel !== 'Never') {
      return null;
    }

    // Create start and end date for the specified month
    const startDate = new Date(shareLink.year, shareLink.month, 1);
    const endDate = new Date(shareLink.year, shareLink.month + 1, 0); // Last day of month

    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get transactions for the user within the specified month
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) =>
        q
          .eq('userId', shareLink.userId as Id<'users'>)
          .gte('datetime', startDateStr)
          .lte('datetime', endDateStr)
      )
      .order('desc')
      .collect();

    return {
      transactions,
      month: shareLink.month,
      year: shareLink.year,
      expiresAt: shareLink.expiresAt,
      permanent: shareLink.expiresAtLabel === 'Never',
    };
  },
});

// Get shared category summary for a specific share link
export const getSharedCategorySummary = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the share link
    const shareLink = await ctx.db
      .query('shareLinks')
      .withIndex('by_shareId', (q) => q.eq('shareId', args.shareId))
      .first();

    if (!shareLink) {
      return null;
    }

    // Check if the share link has expired (if it has an expiration)
    if (shareLink.expiresAt < Date.now() && shareLink.expiresAtLabel !== 'Never') {
      return null;
    }

    // Create start and end date for the specified month
    const startDate = new Date(shareLink.year, shareLink.month, 1);
    const endDate = new Date(shareLink.year, shareLink.month + 1, 0); // Last day of month

    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get transactions for the user within the specified month
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_userId_datetime', (q) =>
        q
          .eq('userId', shareLink.userId as Id<'users'>)
          .gte('datetime', startDateStr)
          .lte('datetime', endDateStr)
      )
      .collect();

    // Calculate totals by category
    const categorySummary: Record<string, { amount: number; count: number }> = {};
    let totalSpent = 0;

    for (const transaction of transactions) {
      const category = transaction.category || 'Uncategorized';

      if (!categorySummary[category]) {
        categorySummary[category] = { amount: 0, count: 0 };
      }

      categorySummary[category].amount += transaction.amount;
      categorySummary[category].count += 1;
      totalSpent += transaction.amount;
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
      month: shareLink.month,
      year: shareLink.year,
      expiresAt: shareLink.expiresAt,
      permanent: shareLink.expiresAtLabel === 'Never',
    };
  },
});
