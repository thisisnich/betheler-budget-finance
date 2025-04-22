import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { formatCurrency } from '@/lib/formatCurrency';
import { format } from 'date-fns';
import { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { TrashIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: {
    _id: Id<'transactions'>;
    amount: number;
    category: string;
    datetime: string;
    description: string;
  };
  onDelete?: () => void;
}

export function TransactionItem({
  transaction,
  onDelete,
}: TransactionItemProps) {
  const deleteTransaction = useSessionMutation(api.transactions.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format the date for display
  const date = new Date(transaction.datetime);
  const formattedDate = format(date, 'PPP');
  const formattedTime = format(date, 'p');

  // Handle deletion of the transaction
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        setIsDeleting(true);
        await deleteTransaction({
          transactionId: transaction._id,
        });
        onDelete?.();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="flex flex-col gap-2">
          {/* Description and Amount */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium truncate">
                {transaction.description}
              </h3>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  {transaction.category}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {formattedDate} {formattedTime}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'text-base sm:text-lg font-semibold whitespace-nowrap',
                transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-2 px-3 sm:px-6 bg-muted/30 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:bg-red-100 h-auto py-1.5"
        >
          <TrashIcon className="h-4 w-4 mr-1.5" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
