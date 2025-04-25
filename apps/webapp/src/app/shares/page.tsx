import { DeleteAllShares } from '@/components/DeleteAllShares';
import { PageHeader } from '@/components/PageHeader';
import { SharesList } from '@/components/SharesList';
import { RequireLogin } from '@/modules/auth/RequireLogin';

export default function SharesPage() {
  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Shared Links"
            action={<DeleteAllShares variant="outline" size="sm" />}
          />

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
