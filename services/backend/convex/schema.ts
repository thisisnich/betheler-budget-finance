import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// DEPRECATION NOTICE: The fields `expiresAt` and `expiresAtLabel` in the sessions table are deprecated and no longer used for session expiry. They are only kept for migration compatibility and will be removed in a future migration.

export default defineSchema({
  appInfo: defineTable({
    latestVersion: v.string(),
  }),
  presentationState: defineTable({
    key: v.string(), // The presentation key that identifies this presentation
    currentSlide: v.number(), // The current slide number
    lastUpdated: v.number(), // Timestamp of last update
  }).index('by_key', ['key']),

  // auth
  users: defineTable(
    v.union(
      v.object({
        type: v.literal('full'),
        name: v.string(),
        username: v.string(),
        email: v.string(),
        recoveryCode: v.optional(v.string()),
      }),
      v.object({
        type: v.literal('anonymous'),
        name: v.string(), //system generated name
        recoveryCode: v.optional(v.string()),
      })
    )
  )
    .index('by_username', ['username'])
    .index('by_email', ['email'])
    .index('by_name', ['name']),

  //sessions
  sessions: defineTable({
    sessionId: v.string(), //this is provided by the client
    userId: v.id('users'), // null means session exists but not authenticated
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // DEPRECATED: No longer used for session expiry. Kept for migration compatibility.
    expiresAtLabel: v.optional(v.string()), // DEPRECATED: No longer used for session expiry. Kept for migration compatibility.
  }).index('by_sessionId', ['sessionId']),

  //transactions
  transactions: defineTable({
    userId: v.id('users'),
    amount: v.number(),
    category: v.string(),
    datetime: v.string(),
    description: v.string(),
    transactionType: v.union(v.literal('expense'), v.literal('income'), v.literal('savings')),
  }).index('by_userId_datetime', ['userId', 'datetime']),

  //budgets
  budgets: defineTable({
    userId: v.id('users'),
    category: v.string(),
    amount: v.number(),
    month: v.number(), // 0-based (January is 0)
    year: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId_yearMonth', ['userId', 'year', 'month'])
    .index('by_userId_category', ['userId', 'category']),

  //shareLinks
  shareLinks: defineTable({
    userId: v.id('users'),
    shareId: v.string(), // Unique identifier for the share link
    year: v.number(),
    month: v.number(),
    createdAt: v.number(),
    expiresAt: v.number(),
    expiresAtLabel: v.string(),
  })
    .index('by_shareId', ['shareId'])
    .index('by_userId', ['userId']),
  //login codes for cross-device authentication
  loginCodes: defineTable({
    code: v.string(), // The 8-letter login code
    userId: v.id('users'), // The user who generated this code
    createdAt: v.number(), // When the code was created
    expiresAt: v.number(), // When the code expires (1 minute after creation)
  }).index('by_code', ['code']),

  allocations: defineTable({
    userId: v.string(), // User ID to associate allocations with a user
    category: v.string(), // Category name
    type: v.string(), // 'amount', 'percentage', or 'overflow'
    value: v.number(), // Fixed amount or percentage value
    priority: v.number(), // Priority for fixed amount or percentage
    alwaysAdd: v.optional(v.boolean()), // Ensure this field is included
  }),
});
