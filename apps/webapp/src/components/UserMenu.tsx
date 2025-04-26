'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface UserMenuProps {
  className?: string;
  alignMenu?: 'start' | 'center' | 'end';
  showNameOnMobile?: boolean;
}

export function UserMenu({ className, alignMenu = 'end', showNameOnMobile = true }: UserMenuProps) {
  const authState = useAuthState();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useSessionMutation(api.auth.logout);

  if (!authState || authState.state !== 'authenticated') {
    return null;
  }

  // Memoize whether we're in mobile menu
  const isMobileMenu = useMemo(() => alignMenu === 'start', [alignMenu]);

  // Use callback for logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router]);

  // Memoize navigation items to ensure consistency with main navigation
  const navItems = useMemo(
    () => [
      { href: '/profile', label: 'Profile' },
      { href: '/app', label: 'Dashboard' },
      { href: '/transactions', label: 'Transactions' },
      { href: '/budgets', label: 'Budgets' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'relative flex items-center gap-2 text-sm font-medium focus:outline-none text-muted-foreground hover:text-foreground',
            isMobileMenu ? 'w-full justify-start py-2 px-3' : '',
            !showNameOnMobile ? 'md:gap-2' : '',
            className
          )}
        >
          <User className="h-4 w-4" />
          <span className={cn(!showNameOnMobile && 'hidden md:inline')}>{authState.user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align={alignMenu}
        className={cn('w-56', isMobileMenu ? 'w-full max-w-none' : '')}
        sideOffset={isMobileMenu ? 0 : 4}
        forceMount
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{authState.user.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <DropdownMenuItem className="cursor-pointer py-2">{item.label}</DropdownMenuItem>
          </Link>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
