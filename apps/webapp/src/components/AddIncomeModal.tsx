import { formatCurrency, parseCurrencyInput } from '@/lib/formatCurrency';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export function AddIncomeModal({ isOpen, onClose, selectedDate, onSuccess }: AddIncomeModalProps) {
  const createTransaction = useSessionMutation(api.transactions.create);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Monthly Income');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format the date as an ISO string for the API
  const formattedDate = selectedDate.toISOString();

  // Format the date string for display
  const displayDate = selectedDate.toLocaleDateString('default', {
    month: 'long',
    year: 'numeric',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = parseCurrencyInput(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid amount greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        amount: parsedAmount,
        category: 'Income',
        datetime: formattedDate,
        description: description.trim() || 'Monthly Income',
        transactionType: 'income',
      });

      toast.success(`Successfully added ${formatCurrency(parsedAmount)} to your income.`);

      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error('Failed to add income. Please try again.');
      console.error('Failed to create transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    // Reset form
    setAmount('');
    setDescription('Monthly Income');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Add income for {displayDate}. This will help track your financial overview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Monthly Income"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
