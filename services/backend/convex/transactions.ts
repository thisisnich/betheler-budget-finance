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
    const transactions = await ctx.db
      .query("transactions")
      .filter(q => q.eq(q.field("userId"), user._id))
      .filter(q => q.gte(q.field("datetime"), oneMonthAgoStr))
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