import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { formatCurrency } from '@/lib/formatCurrency';
import { format } from 'date-fns';
import { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { TrashIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

interface TransactionItemProps {
  transaction: {
    _id: Id<"transactions">;
    amount: number;
    category: string;
    datetime: string;
    description: string;
  };
  onDelete?: () => void;
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
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
          transactionId: transaction._id 
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
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{transaction.description}</h3>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>
            <span className={`text-lg font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-2 px-6 bg-muted/30 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
} 