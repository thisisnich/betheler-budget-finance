'use client';
import { formatCurrency } from '@/lib/formatCurrency';
import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { type CategoryData, CategoryPieChart } from './CategoryPieChart';
import { ShareNotFound } from './ShareNotFound';
import { TransactionItem } from './TransactionItem';

interface SharedTransactionViewProps {
  shareId: string;
}

export function SharedTransactionView({ shareId }: SharedTransactionViewProps) {
  // Fetch shared transactions and category data
  const sharedTransactions = useQuery(api.sharing.getSharedTransactions, {
    shareId,
  });

  const categorySummary = useQuery(api.sharing.getSharedCategorySummary, {
    shareId,
  });

  // Pre-compute all memoized values
  const expirationDate = useMemo(() => {
    if (!sharedTransactions || sharedTransactions === null) return null;
    const expiryDate = new Date(sharedTransactions.expiresAt);
    return expiryDate.toLocaleDateString();
  }, [sharedTransactions]);

  const formattedMonthYear = useMemo(() => {
    if (!sharedTransactions || sharedTransactions === null) return '';
    const date = new Date(sharedTransactions.year, sharedTransactions.month);
    return date.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }, [sharedTransactions]);

  const total = useMemo(() => {
    if (!sharedTransactions || sharedTransactions === null) return 0;
    return sharedTransactions.transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [sharedTransactions]);

  const transactionCountMessage = useMemo(() => {
    if (!sharedTransactions || sharedTransactions === null) return '';
    return `(${sharedTransactions.transactions.length} transactions)`;
  }, [sharedTransactions]);

  // If data is still loading
  if (sharedTransactions === undefined || categorySummary === undefined) {
    return (
      <div className="py-8 text-center flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading shared data...</span>
      </div>
    );
  }

  // If share not found or expired
  if (sharedTransactions === null || categorySummary === null) {
    return <ShareNotFound />;
  }

  return (
    <div className="container py-6 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shared Expenses</h1>
        <p className="text-muted-foreground">For {formattedMonthYear}</p>
        {!sharedTransactions.permanent && (
          <p className="text-xs text-muted-foreground mt-1">
            This shared view is available until {expirationDate}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Transactions Total */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium mb-2">Transactions Total</h3>
            <span className={`text-xl font-bold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(total)}
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              For {formattedMonthYear} {transactionCountMessage}
            </p>
          </div>
        </div>

        {/* Category Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <CategoryPieChart
            data={categorySummary.categories as CategoryData[]}
            totalSpent={categorySummary.totalSpent}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Transactions</h2>

      {/* If no transactions found */}
      {sharedTransactions.transactions.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">No transactions found for this period.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sharedTransactions.transactions.map((transaction) => (
            <TransactionItem key={transaction._id} transaction={transaction} readOnly={true} />
          ))}
        </div>
      )}
    </div>
  );
}
