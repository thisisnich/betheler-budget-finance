'use client';

import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { api } from '@workspace/backend/convex/_generated/api';
import type { Doc } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  PiggyBank,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface TransactionItemProps {
  transaction: Doc<'transactions'>;
  onDelete?: () => void;
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTransaction = useSessionMutation(api.transactions.remove);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction({ transactionId: transaction._id });
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const transactionDate = format(new Date(transaction.datetime), 'MMM d, yyyy');
  const transactionTime = format(new Date(transaction.datetime), 'h:mm a');

  const transactionType = transaction.transactionType || 'expense';
  const isIncome = transactionType === 'income';
  const isSavings = transactionType === 'savings';

  const getTransactionIcon = () => {
    switch (transactionType) {
      case 'income':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case 'savings':
        return <PiggyBank className="h-4 w-4 text-blue-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
  };

  const getAmountColor = () => {
    switch (transactionType) {
      case 'income':
        return 'text-emerald-600';
      case 'savings':
        return 'text-blue-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getTransactionIcon()}

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className="text-sm font-medium truncate">{transaction.description}</p>
                  {transaction.category && (
                    <div className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {transaction.category}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {transactionDate} at {transactionTime}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className={cn('font-medium', getAmountColor())}>
                {isIncome ? '+' : ''}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
