'use client';

import { BudgetList } from '@/components/BudgetList';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { useState } from 'react';

export default function BudgetsPage() {
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
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Budget Management</h1>
            <p className="text-muted-foreground">
              Set budgets for each category and track your spending against them.
            </p>
          </div>

          <div className="mb-6">
            <MonthYearPicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full max-w-sm"
            />
          </div>

          <BudgetList year={year} month={month} />
        </div>
      </div>
    </RequireLogin>
  );
}
