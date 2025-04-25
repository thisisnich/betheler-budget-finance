'use client';

import { RecentSharesList } from '@/components/RecentSharesList';
import { ShareButton } from '@/components/ShareButton';
import { SpendingGraph } from '@/components/SpendingGraph';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import Link from 'next/link';

export default function AppPage() {
  const authState = useAuthState();

  // Get current date for the share button
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
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

              <div className="bg-card rounded-lg border p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Spending Overview</h2>
                  <ShareButton year={currentYear} month={currentMonth} />
                </div>
                <SpendingGraph />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-card">
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/transactions" className="block">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Add New Transaction
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
