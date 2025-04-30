'use client';

import { BudgetBalanceSummary } from '@/components/BudgetBalanceSummary';
import { BudgetList } from '@/components/BudgetList';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { PageHeader } from '@/components/PageHeader';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useState } from 'react';

export default function BudgetsPage() {
  const initialYear = 2025; // Replace with the desired year
  const initialMonth = 4; // Replace with the desired month (0 for January, 1 for February, etc.)
  const summary = useSessionQuery(api.transactions.getMonthlyFinancialSummary, {
    year: initialYear,
    month: initialMonth,
  });

  console.log('Financial Summary:', summary);

  // Get current date for initial state
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now);

  // Extract year and month for API calls
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Budget Management"
            description="Set budgets for each category and track your spending against them."
          />

          <div className="mb-6">
            <MonthYearPicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full max-w-sm"
            />
          </div>

          {/* Budget Balance Summary */}
          <BudgetBalanceSummary year={year} month={month} />

          <BudgetList year={year} month={month} />
        </div>
      </div>
    </RequireLogin>
  );
}
