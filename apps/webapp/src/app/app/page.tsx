'use client';

import { MonthYearPicker } from '@/components/MonthYearPicker';
import { MonthlySummaryCard } from '@/components/MonthlySummaryCard';
import { RecentSharesList } from '@/components/RecentSharesList';
import { ShareButton } from '@/components/ShareButton';
import { SpendingGraph } from '@/components/SpendingGraph';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AppPage() {
  const authState = useAuthState();

  // Shared date state for the financial view
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <div className="flex gap-2">
                <Link href="/transactions">
                  <Button size="sm">View Transactions</Button>
                </Link>
              </div>
            </div>
          </div>

          {authState?.state === 'authenticated' && (
            <div className="space-y-6 sm:space-y-8">
              {authState.user.type === 'anonymous' && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Tip:</span> You're using an anonymous account.
                    Visit your{' '}
                    <Link href="/profile" className="text-blue-600 underline hover:text-blue-800">
                      profile page
                    </Link>{' '}
                    to personalize your display name.
                  </p>
                </div>
              )}

              {/* Unified Financial View */}
              <div className="bg-card rounded-lg border p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Financial Overview</h2>
                  <div className="flex items-center gap-3">
                    <ShareButton
                      year={selectedDate.getFullYear()}
                      month={selectedDate.getMonth()}
                    />
                  </div>
                </div>
                <div className="mb-3 flex justify-center">
                  <div className="w-1/2">
                    <MonthYearPicker value={selectedDate} onChange={setSelectedDate} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Summary Section */}
                  <div>
                    <MonthlySummaryCard
                      selectedDate={selectedDate}
                      noCard={true}
                      onDataChange={() => {
                        // Force a refresh of the component by creating a new date object
                        // This will trigger the useSessionQuery hooks to refetch data
                        setSelectedDate(new Date(selectedDate.getTime()));
                      }}
                    />
                  </div>

                  {/* Spending Section */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-sm font-medium">Spending</h3>
                    </div>
                    <SpendingGraph
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      showDatePicker={false}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-card">
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/transactions" className="block">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Add New Transaction
                      </Button>
                    </Link>
                    <Link href="/budgets" className="block">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Manage Budgets
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-card">
                  <h3 className="font-medium mb-2">Financial Tips</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your spending regularly to stay on top of your budget.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireLogin>
  );
}
