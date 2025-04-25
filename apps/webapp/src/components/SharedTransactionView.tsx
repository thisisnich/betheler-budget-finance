'use client';
import { formatCurrency } from '@/lib/formatCurrency';
import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { CoinsIcon, Loader2, PieChartIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SpendingBreakdownChart } from './CategoryPieChart';
import { ShareNotFound } from './ShareNotFound';
import { TransactionItem } from './TransactionItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SharedTransactionViewProps {
  shareId: string;
}

export function SharedTransactionView({ shareId }: SharedTransactionViewProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'allocation' | 'expenses'>('expenses');

  // Fetch shared transactions and category data
  const sharedTransactions = useQuery(api.sharing.getSharedTransactions, {
    shareId,
  });

  // Fetch expense categories
  const expenseCategorySummary = useQuery(api.sharing.getSharedCategorySummary, {
    shareId,
    transactionType: 'expense',
  });

  // Fetch all transactions for fund allocation
  const allCategorySummary = useQuery(api.sharing.getSharedCategorySummary, {
    shareId,
  });

  // Fetch financial summary data
  const financialSummary = useQuery(api.sharing.getSharedFinancialSummary, {
    shareId,
  });

  // Fetch budget data
  const budgetSummary = useQuery(api.sharing.getSharedBudgetSummary, {
    shareId,
  });

  // Fetch budget progress data
  const budgetProgress = useQuery(api.sharing.getSharedBudgetProgress, {
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

  // Calculate unallocated funds
  const unallocatedFunds = useMemo(() => {
    if (!financialSummary || financialSummary === null || !budgetSummary || budgetSummary === null)
      return 0;

    // Get savings total from transactions
    const savingsTotal =
      sharedTransactions?.transactions
        .filter((tx) => tx.transactionType === 'savings')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

    return Math.max(0, financialSummary.totalIncome - savingsTotal - budgetSummary.totalBudget);
  }, [financialSummary, budgetSummary, sharedTransactions]);

  // Prepare fund allocation data
  const allocationData = useMemo(() => {
    if (!budgetSummary || budgetSummary === null || !budgetProgress || budgetProgress === null)
      return [];

    // Create savings entry from transactions
    const savingsAmount =
      sharedTransactions?.transactions
        .filter((tx) => tx.transactionType === 'savings')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

    // Extract budget categories from budgetProgress
    const budgetCategories = budgetProgress.budgeted.map((budget) => ({
      category: budget.category,
      amount: budget.amount,
      percentage: 0, // Will be calculated later
    }));

    const data = [
      // Only include savings if there are any
      ...(savingsAmount > 0
        ? [
            {
              category: 'Savings',
              amount: savingsAmount,
              percentage: 0, // Will be calculated later
            },
          ]
        : []),
      ...budgetCategories,
    ];

    // Only include unallocated funds if there are any
    if (unallocatedFunds > 0) {
      data.push({
        category: 'Unallocated',
        amount: unallocatedFunds,
        percentage: 0, // Will be calculated later
      });
    }

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    // Calculate percentages
    for (const item of data) {
      item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
    }

    return data;
  }, [budgetSummary, budgetProgress, sharedTransactions, unallocatedFunds]);

  // Calculate total allocated funds
  const totalAllocated = useMemo(() => {
    if (!allocationData.length) return 0;
    return allocationData.reduce((sum, item) => sum + item.amount, 0);
  }, [allocationData]);

  // If data is still loading
  if (
    sharedTransactions === undefined ||
    expenseCategorySummary === undefined ||
    allCategorySummary === undefined ||
    financialSummary === undefined ||
    budgetSummary === undefined ||
    budgetProgress === undefined
  ) {
    return (
      <div className="py-8 text-center flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading shared data...</span>
      </div>
    );
  }

  // If share not found or expired
  if (
    sharedTransactions === null ||
    expenseCategorySummary === null ||
    allCategorySummary === null ||
    financialSummary === null ||
    budgetSummary === null ||
    budgetProgress === null
  ) {
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
              {formatCurrency(Math.abs(total))}
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              For {formattedMonthYear} {transactionCountMessage}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="p-4 bg-muted rounded-lg">
          <Tabs
            defaultValue="allocation"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'allocation' | 'expenses')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="allocation" className="flex items-center gap-1">
                <CoinsIcon className="h-4 w-4" />
                <span>Fund Allocation</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                <span>Expenses</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allocation" className="pt-2">
              {financialSummary && financialSummary.totalIncome <= 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No income recorded for this month.</p>
                </div>
              ) : allocationData.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No budgets or savings for this month.</p>
                </div>
              ) : (
                <div>
                  {/* Financial Information Summary */}
                  <div className="mb-4 text-sm grid grid-cols-3 gap-2">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-green-800 font-medium">Income</div>
                      <div className="text-green-600">
                        {formatCurrency(financialSummary.totalIncome)}
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-blue-800 font-medium">Savings</div>
                      <div className="text-blue-600">
                        {formatCurrency(
                          sharedTransactions.transactions
                            .filter((tx) => tx.transactionType === 'savings')
                            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <div className="text-amber-800 font-medium">Budgeted</div>
                      <div className="text-amber-600">
                        {formatCurrency(budgetSummary.totalBudget)}
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <SpendingBreakdownChart
                    data={allocationData}
                    totalSpent={totalAllocated}
                    title="Fund Allocation"
                  />

                  {/* Legend and Explanation */}
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>
                      This chart shows how your income is allocated across savings, budget
                      categories, and any unallocated funds.
                    </p>
                    {unallocatedFunds > 0 && (
                      <p className="mt-1">
                        <span className="font-medium">Unallocated: </span>
                        {formatCurrency(unallocatedFunds)} is not assigned to any budget or savings.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="pt-2">
              {expenseCategorySummary.categories.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No expense transactions recorded for this month.</p>
                </div>
              ) : (
                <SpendingBreakdownChart
                  data={expenseCategorySummary.categories}
                  totalSpent={expenseCategorySummary.totalSpent}
                  title="Expenses by Category"
                />
              )}
            </TabsContent>
          </Tabs>
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
            <TransactionItem key={transaction._id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
