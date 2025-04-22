'use client';

import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthState } from '@/modules/auth/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileMenu } from './MobileMenu';

export function Navigation() {
  const pathname = usePathname();
  const authState = useAuthState();
  const isAuthenticated = authState?.state === 'authenticated';

  // Create navigation items array to reuse in both desktop and mobile menus
  const navItems = [
    {
      href: '/',
      label: 'Home',
      isActive: pathname === '/',
    },
    ...(isAuthenticated
      ? [
          {
            href: '/app',
            label: 'App',
            isActive: pathname.startsWith('/app'),
          },
          {
            href: '/transactions',
            label: 'Transactions',
            isActive: pathname.startsWith('/transactions'),
          },
          {
            href: '/profile',
            label: 'Profile',
            isActive: pathname.startsWith('/profile'),
          },
        ]
      : []),
  ];

  // Login button to reuse in both desktop and mobile views
  const loginButton = (
    <Link href="/login" className="w-full">
      <Button size="sm" variant="outline" className="w-full">
        Login
      </Button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="mr-6 flex">
          <Link href="/" className="flex items-center whitespace-nowrap">
            <span className="font-bold text-lg">Budget</span>
          </Link>
        </div>
        <nav className="flex items-center justify-between w-full">
          <div className="flex gap-6 text-sm">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/' ? 'text-foreground font-medium' : 'text-foreground/60'
              )}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/app"
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname.startsWith('/app')
                      ? 'text-foreground font-medium'
                      : 'text-foreground/60'
                  )}
                >
                  App
                </Link>
                <Link
                  href="/transactions"
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname.startsWith('/transactions')
                      ? 'text-foreground font-medium'
                      : 'text-foreground/60'
                  )}
                >
                  Transactions
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname.startsWith('/profile')
                      ? 'text-foreground font-medium'
                      : 'text-foreground/60'
                  )}
                >
                  Profile
                </Link>
              </>
            )}
          </div>
          <div>
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
