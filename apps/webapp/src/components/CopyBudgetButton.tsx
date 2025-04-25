import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { format } from 'date-fns';
import { CheckIcon, CopyIcon, Loader2Icon } from 'lucide-react';
import { type ReactNode, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CopyBudgetButtonProps {
  targetYear: number;
  targetMonth: number;
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  icon?: ReactNode;
  label?: string;
}

export function CopyBudgetButton({
  targetYear,
  targetMonth,
  onSuccess,
  variant = 'outline',
  size = 'sm',
  fullWidth = false,
  icon = <CopyIcon className="h-4 w-4" />,
  label = 'Copy from Previous Month',
}: CopyBudgetButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyBudgets = useSessionMutation(api.budgets.copyBudgetsFromMonth);

  // Create month options for the last 12 months (excluding current month)
  const monthOptions = useCallback(() => {
    const options = [];
    const currentDate = new Date(targetYear, targetMonth);

    // Add the last 12 months as options
    for (let i = 1; i <= 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);

      const value = `${date.getFullYear()}-${date.getMonth()}`;
      const label = format(date, 'MMMM yyyy');

      options.push({ value, label, year: date.getFullYear(), month: date.getMonth() });
    }

    return options;
  }, [targetYear, targetMonth]);

  // Handle copy
  const handleCopy = useCallback(async () => {
    if (!selectedMonth) return;

    try {
      setIsLoading(true);

      // Parse year and month from the selected value (format: "2023-5")
      const [sourceYear, sourceMonth] = selectedMonth.split('-').map(Number);

      const result = await copyBudgets({
        sourceYear,
        sourceMonth,
        targetYear,
        targetMonth,
      });

      if (result.copied === 0) {
        toast.info(
          result.total === 0
            ? 'No budgets found to copy'
            : 'All categories already have budgets in the target month'
        );
      } else {
        toast.success(
          `Copied ${result.copied} budget${result.copied !== 1 ? 's' : ''} from ${format(
            new Date(sourceYear, sourceMonth),
            'MMMM yyyy'
          )}`
        );
        setIsCopied(true);

        // After a brief delay, close the dialog and reset state
        setTimeout(() => {
          setOpen(false);
          setIsCopied(false);
          setSelectedMonth(undefined);
          onSuccess?.();
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to copy budgets');
      console.error('Error copying budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, copyBudgets, targetYear, targetMonth, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`${fullWidth ? 'w-full' : ''} gap-2`}>
          {icon}
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy Budgets</DialogTitle>
          <DialogDescription>
            Copy your budget entries from a previous month to{' '}
            {format(new Date(targetYear, targetMonth), 'MMMM yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm mb-2">Select source month:</p>
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
            disabled={isLoading || isCopied}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-muted-foreground mt-3">
            This will copy all budget entries from the selected month. Existing budgets in the
            current month will not be modified.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            disabled={!selectedMonth || isLoading || isCopied}
            onClick={handleCopy}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Copying...
              </>
            ) : isCopied ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              'Copy Budgets'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
