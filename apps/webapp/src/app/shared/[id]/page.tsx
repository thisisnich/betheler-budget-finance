import { ConvexClientProvider } from '@/app/ConvexClientProvider';
import { SharedTransactionView } from '@/components/SharedTransactionView';

export default async function SharedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ConvexClientProvider>
      <SharedTransactionView shareId={id} />
    </ConvexClientProvider>
  );
}

export const metadata = {
  title: 'Shared Expenses',
  description: 'View shared expense data for a specific period.',
};
