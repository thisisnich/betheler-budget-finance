import { formatCurrency } from '@/lib/formatCurrency';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { DollarSignIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { BudgetProgress } from './BudgetProgress';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface BudgetSummaryCardProps {
  year: number;
  month: number;
}

export function BudgetSummaryCard({ year, month }: BudgetSummaryCardProps) {
  // Fetch the budget summary data
  const budgetSummary = useSessionQuery(api.budgets.getTotalBudgetSummary, {
    year,
    month,
  });

  // Format month and year for display
  const formattedMonthYear = new Date(year, month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Loading state
  if (budgetSummary === undefined) {
    return (
      <Card className="bg-card">
        <CardContent className="pt-6 flex justify-center items-center min-h-[180px]">
          <div className="flex items-center gap-2">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            <span>Loading budget data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state when no budgets exist
  if (budgetSummary.budgetCount === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Budget</CardTitle>
          <CardDescription>No budgets set for {formattedMonthYear}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Set up your budget to track your spending goals
            </p>
            <Link href="/budgets">
              <Button>Create a Budget</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display the budget summary
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Monthly Budget</CardTitle>
            <CardDescription>{formattedMonthYear}</CardDescription>
          </div>
          <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-xl font-semibold">{formatCurrency(budgetSummary.totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-xl font-semibold">{formatCurrency(budgetSummary.totalSpent)}</p>
            </div>
          </div>

          <BudgetProgress
            percentage={budgetSummary.percentSpent}
            status={budgetSummary.status as 'within_budget' | 'over_budget'}
          />

          <div className="flex justify-between items-center mt-1">
            <p className="text-sm">
              {budgetSummary.status === 'within_budget' ? 'Remaining:' : 'Over budget by:'}
            </p>
            <p
              className={`font-medium ${
                budgetSummary.status === 'within_budget' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {budgetSummary.status === 'within_budget'
                ? formatCurrency(budgetSummary.totalRemaining)
                : formatCurrency(Math.abs(budgetSummary.totalRemaining))}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Link href="/budgets" className="w-full">
          <Button variant="outline" className="w-full">
            View All Budgets
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
