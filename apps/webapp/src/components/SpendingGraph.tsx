import { useMemo, useState, useEffect } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { api } from '@workspace/backend/convex/_generated/api';
import { formatCurrency } from '@/lib/formatCurrency';
import { MonthYearPicker } from './MonthYearPicker';
import { CategoryPieChart } from './CategoryPieChart';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';

export function SpendingGraph() {
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

  // Fetch category summary data for the pie chart
  const categorySummary = useSessionQuery(api.transactions.getCategorySummary, {
    year,
    month,
  });

  // Get transaction count for the month
  const transactions = useSessionQuery(api.transactions.listByMonth, {
    year,
    month,
  });

  // Calculate total for all transactions - memoize this computation
  const total = useMemo(
    () => transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0,
    [transactions]
  );

  // Handle month change with useCallback
  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

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
  }, [transactions?.length]);

  // If data is still loading
  if (categorySummary === undefined || transactions === undefined) {
    return (
      <div className="py-8 text-center flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading spending data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <MonthYearPicker
          value={selectedDate}
          onChange={handleMonthChange}
          className="mb-4"
        />
      </div>

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="text-base sm:text-lg font-medium">Monthly Overview</h3>
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

      {/* Show pie chart if we have category data and transactions */}
      {categorySummary && transactions.length > 0 ? (
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <CategoryPieChart
              data={categorySummary.categories}
              totalSpent={Math.abs(categorySummary.totalSpent)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="py-6 sm:py-8 text-center">
          <p className="text-muted-foreground">
            No transactions found for {formattedMonthYear}.
          </p>
          <p className="mt-2">
            Add transactions to see your spending breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
