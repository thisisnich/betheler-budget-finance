import { ConvexClientProvider } from '@/app/ConvexClientProvider';
import { SharedTransactionView } from '@/components/SharedTransactionView';

interface SharedPageProps {
  params: {
    id: string;
  };
}

export default function SharedPage({ params }: SharedPageProps) {
  return (
    <ConvexClientProvider>
      <SharedTransactionView shareId={params.id} />
    </ConvexClientProvider>
  );
}

export const metadata = {
  title: 'Shared Expenses',
  description: 'View shared expense data for a specific period.',
};
