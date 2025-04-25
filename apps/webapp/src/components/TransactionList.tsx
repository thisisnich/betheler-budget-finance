import { formatCurrency } from '@/lib/formatCurrency';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { MonthYearPicker } from './MonthYearPicker';
import { TransactionItem } from './TransactionItem';

export function TransactionList() {
  // Get current date for initial state
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now);

  // Extract year and month (0-based) from selected date - memoize to prevent recalculation
  const { year, month } = useMemo(
    () => ({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
    }),
    [selectedDate]
  );

  // Fetch transactions for the selected month
  const transactions = useSessionQuery(api.transactions.listByMonth, {
    year,
    month,
  });

  // Calculate total for all transactions - memoize this computation
  const total = useMemo(
    () => transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0,
    [transactions]
  );

  // Function to refresh transactions list after deletion with useCallback
  const handleTransactionDeleted = useCallback(() => {
    // The list will automatically refresh due to Convex's reactivity
  }, []);

  // Handle month change with useCallback
  const handleMonthChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Memoize the formatted month and year for display
  const formattedMonthYear = useMemo(() => {
    return selectedDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Memoize the transaction count message
  const transactionCountMessage = useMemo(() => {
    return transactions ? `(${transactions.length} transactions)` : '';
  }, [transactions]);

  // If transactions are still loading
  if (transactions === undefined) {
    return (
      <div className="py-8 text-center flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading transactions...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <MonthYearPicker value={selectedDate} onChange={handleMonthChange} className="mb-4" />
      </div>

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="text-base sm:text-lg font-medium">Transactions Total</h3>
          <span
            className={`text-lg sm:text-xl font-bold ${
              total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(total)}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          For {formattedMonthYear} {transactionCountMessage}
        </p>
      </div>

      {/* If no transactions found */}
      {transactions.length === 0 ? (
        <div className="py-6 sm:py-8 text-center">
          <p className="text-muted-foreground">No transactions found for {formattedMonthYear}.</p>
          <p className="mt-2">Add a new transaction to get started.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction._id}
              transaction={transaction}
              onDelete={handleTransactionDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
