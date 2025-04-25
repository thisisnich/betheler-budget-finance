import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
      }),
      v.object({
        type: v.literal('anonymous'),
        name: v.string(), //system generated name
      })
    )
  )
    .index('by_username', ['username'])
    .index('by_email', ['email']),

  //sessions
  sessions: defineTable({
    sessionId: v.string(), //this is provided by the client
    userId: v.id('users'), // null means session exists but not authenticated
    createdAt: v.number(),
    expiresAt: v.number(),
    expiresAtLabel: v.string(),
  }).index('by_sessionId', ['sessionId']),

  //transactions
  transactions: defineTable({
    userId: v.id('users'),
    amount: v.number(),
    category: v.string(),
    datetime: v.string(),
    description: v.string(),
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
});
