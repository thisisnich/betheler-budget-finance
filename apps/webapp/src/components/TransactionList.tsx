import { useCallback } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { api } from '@workspace/backend/convex/_generated/api';
import { TransactionItem } from './TransactionItem';
import { formatCurrency } from '@/lib/formatCurrency';

export function TransactionList() {
  const transactions = useSessionQuery(api.transactions.listForPastMonth);

  // Calculate total for all transactions
  const total = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Function to refresh transactions list after deletion
  const handleTransactionDeleted = useCallback(() => {
    // The list will automatically refresh due to Convex's reactivity
  }, []);

  // If transactions are still loading
  if (transactions === undefined) {
    return <div className="py-8 text-center">Loading transactions...</div>;
  }

  // If no transactions found
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No transactions found in the past month.</p>
        <p className="mt-2">Add a new transaction to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Transactions Total</h3>
          <span className={`text-xl font-bold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(total)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          For the past month ({transactions.length} transactions)
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            onDelete={handleTransactionDeleted}
          />
        ))}
      </div>
    </div>
  );
} 