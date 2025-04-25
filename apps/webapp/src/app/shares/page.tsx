import { DeleteAllShares } from '@/components/DeleteAllShares';
import { SharesList } from '@/components/SharesList';
import { Button } from '@/components/ui/button';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default function SharesPage() {
  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/app">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeftIcon className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Shared Links</h1>
            <DeleteAllShares variant="outline" size="sm" />
          </div>

          <div className="bg-card rounded-lg border p-4 sm:p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Manage all your active shared expense links. You can delete links at any time to
              revoke access.
            </p>

            <SharesList />
          </div>
        </div>
      </div>
    </RequireLogin>
  );
}

export const metadata = {
  title: 'Shared Links',
  description: 'Manage your shared expense links',
};
