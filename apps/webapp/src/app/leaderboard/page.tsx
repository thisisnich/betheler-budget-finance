'use client';

import { MonthYearPicker } from '@/components/MonthYearPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Medal, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

export default function LeaderboardPage() {
  const authState = useAuthState();

  // Month/year state for the leaderboard
  const [selectedDate, setSelectedDate] = useState(new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get leaderboard data using the public endpoint
  const leaderboardData = useQuery(api.transactions.getPublicLeaderboard, {
    year,
    month,
  });

  // Function to get medal color
  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return 'text-yellow-500'; // Gold
      case 1:
        return 'text-gray-400'; // Silver
      case 2:
        return 'text-amber-700'; // Bronze
      default:
        return 'text-gray-300'; // Other positions
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
            Transaction Leaderboard <span className="ml-2">👑</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            See who's tracking their finances the most each month
          </p>

          {/* Centered month picker */}
          <div className="flex justify-center mb-4">
            <MonthYearPicker value={selectedDate} onChange={setSelectedDate} className="mx-auto" />
          </div>
        </div>

        <Card className="shadow-md border-t-4 border-t-yellow-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center justify-center text-xl">
              <Users className="h-5 w-5 mr-2" /> Top Finance Trackers
              <span className="text-sm font-normal ml-2">(Top 50 shown)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboardData ? (
              <div>
                {leaderboardData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">
                    No transaction data available for this month
                  </p>
                ) : (
                  <div className="divide-y">
                    {/* Top 3 users with special styling */}
                    {leaderboardData.slice(0, 3).map((user, index) => (
                      <div
                        key={user.userId}
                        className={`flex items-center justify-between p-5 ${
                          index === 0
                            ? 'bg-yellow-50'
                            : index === 1
                              ? 'bg-gray-50'
                              : index === 2
                                ? 'bg-amber-50'
                                : ''
                        } ${
                          authState?.state === 'authenticated' && authState.user._id === user.userId
                            ? 'border-l-4 border-primary'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-background to-muted shadow-sm">
                            <Medal className={`w-5 h-5 ${getMedalColor(index)}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {user.name}
                              {index === 0 && <span className="ml-2">👑</span>}
                            </p>
                            {authState?.state === 'authenticated' &&
                              authState.user._id === user.userId && (
                                <span className="text-xs text-primary font-medium">(You)</span>
                              )}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-lg bg-muted/30 px-4 py-1 rounded-full">
                          {user.transactionCount}{' '}
                          {user.transactionCount === 1 ? 'transaction' : 'transactions'}
                        </div>
                      </div>
                    ))}

                    {/* Rest of users up to top 50 */}
                    {leaderboardData.slice(3, 50).map((user, index) => (
                      <div
                        key={user.userId}
                        className={`flex items-center justify-between py-4 px-5 ${
                          authState?.state === 'authenticated' && authState.user._id === user.userId
                            ? 'bg-muted/30 border-l-4 border-primary'
                            : ''
                        } hover:bg-muted/10 transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 text-center">
                            <span className="text-muted-foreground font-medium">{index + 4}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            {authState?.state === 'authenticated' &&
                              authState.user._id === user.userId && (
                                <span className="text-xs text-primary font-medium">(You)</span>
                              )}
                          </div>
                        </div>
                        <div className="font-mono font-medium bg-muted/20 px-3 py-1 rounded-full text-sm">
                          {user.transactionCount}{' '}
                          {user.transactionCount === 1 ? 'transaction' : 'transactions'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center py-16">
                <div className="animate-pulse text-center">
                  <p>Loading leaderboard data...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
