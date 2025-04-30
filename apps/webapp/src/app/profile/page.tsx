'use client';

import { DarkModeToggle } from '@/components/DarkModeToggle'; // Import the toggle component
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { LoginCodeGenerator } from '@/modules/auth/LoginCodeGenerator';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { NameEditForm } from '@/modules/profile/NameEditForm';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ProfilePage() {
  const authState = useAuthState();

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => authState?.state === 'authenticated', [authState]);

  // Check if user is anonymous
  const isAnonymousUser = useMemo(
    () =>
      isAuthenticated && authState && 'user' in authState && authState.user.type === 'anonymous',
    [authState, isAuthenticated]
  );

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-end mb-6">
            <DarkModeToggle /> {/* Add the dark mode toggle here */}
          </header>
          <Card className="p-6 mb-6 bg-card dark:bg-card-dark">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

            {isAuthenticated && (
              <div className="space-y-8">
                <div className="p-4 rounded-md bg-muted dark:bg-muted/20">
                  <h2 className="text-xl font-semibold mb-2">Account Information</h2>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="font-medium">Account Type:</span>{' '}
                      {isAnonymousUser ? (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--badge-anonymous-bg)',
                            color: 'var(--badge-anonymous-text)',
                          }}
                        >
                          Anonymous
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--badge-full-bg)',
                            color: 'var(--badge-full-text)',
                          }}
                        >
                          Full Account
                        </span>
                      )}
                    </div>
                    {isAnonymousUser && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        You are using an anonymous account. Your data will be available as long as
                        you use the same device and don't clear your browser data.
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <NameEditForm />
                </div>

                {isAnonymousUser && (
                  <div className="border-t pt-6">
                    <LoginCodeGenerator />
                  </div>
                )}

                <div className="border-t pt-6 flex justify-end">
                  <Link href="/app">
                    <Button variant="outline" aria-label="Return to app">
                      Back to App
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </RequireLogin>
  );
}
