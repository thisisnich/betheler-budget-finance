import { useCallback, useState } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { api } from '@workspace/backend/convex/_generated/api';
import { TransactionItem } from './TransactionItem';
import { formatCurrency } from '@/lib/formatCurrency';
import { MonthYearPicker } from './MonthYearPicker';
import { CategoryPieChart, CategoryData } from './CategoryPieChart';
import { Card, CardContent } from './ui/card';

export function TransactionList() {
  // Get current date for initial state
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now);
  
  // Extract year and month (0-based) from selected date
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  // Fetch transactions for the selected month
  const transactions = useSessionQuery(api.transactions.listByMonth, {
    year,
    month,
  });
  
  // Fetch category summary data for the pie chart
  const categorySummary = useSessionQuery(api.transactions.getCategorySummary, {
    year,
    month,
  });
  
  // Calculate total for all transactions
  const total = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Function to refresh transactions list after deletion
  const handleTransactionDeleted = useCallback(() => {
    // The list will automatically refresh due to Convex's reactivity
  }, []);

  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

  // If transactions are still loading
  if (transactions === undefined) {
    return <div className="py-8 text-center">Loading transactions...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <MonthYearPicker 
          value={selectedDate} 
          onChange={handleMonthChange}
          className="mb-4"
        />
      </div>
      
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Transactions Total</h3>
          <span className={`text-xl font-bold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(total)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          For {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })} ({transactions.length} transactions)
        </p>
      </div>
      
      {/* Show pie chart if we have category data and transactions */}
      {categorySummary && transactions.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <CategoryPieChart 
              data={categorySummary.categories} 
              totalSpent={Math.abs(categorySummary.totalSpent)}
            />
          </CardContent>
        </Card>
      )}

      {/* If no transactions found */}
      {transactions.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No transactions found for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
          <p className="mt-2">Add a new transaction to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
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