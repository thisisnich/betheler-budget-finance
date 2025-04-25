import { internalMutation } from './_generated/server';

export const migrateTransactionType = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const transactions = await ctx.db.query('transactions').collect();
    // mark all of those with undefined type as 'expense'
    for (const transaction of transactions) {
      if (transaction.transactionType === undefined) {
        await ctx.db.patch(transaction._id, {
          transactionType: 'expense',
        });
      }
    }
  },
});
