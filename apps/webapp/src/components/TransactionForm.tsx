import { parseCurrencyInput } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CategorySelect } from './CategorySelect';
import { DateTimePicker } from './DateTimePicker';
import { type TransactionType, TransactionTypeSelect } from './TransactionTypeSelect';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

interface TransactionFormProps {
  onSuccess?: () => void;
  className?: string;
}

interface TransactionFormValues {
  amount: string;
  category: string;
  description: string;
  datetime: Date;
  transactionType: TransactionType;
}

export function TransactionForm({ onSuccess, className }: TransactionFormProps) {
  const createTransaction = useSessionMutation(api.transactions.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionFormValues>({
    defaultValues: {
      amount: '',
      category: 'Food',
      description: '',
      datetime: new Date(),
      transactionType: 'expense',
    },
  });

  const transactionType = form.watch('transactionType');
  const showCategoryField = transactionType === 'expense' || transactionType === 'savings';

  const onSubmit = useCallback(
    async (data: TransactionFormValues) => {
      try {
        setIsSubmitting(true);
        const amount = parseCurrencyInput(data.amount);

        if (!amount) {
          form.setError('amount', {
            message: 'Please enter a valid amount',
          });
          return;
        }

        await createTransaction({
          amount,
          category: showCategoryField ? data.category : undefined,
          description: data.description,
          datetime: data.datetime.toISOString(),
          transactionType: data.transactionType,
        });

        form.reset();
        onSuccess?.();
      } catch (error) {
        console.error('Failed to create transaction:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [createTransaction, form, onSuccess, showCategoryField]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Transaction Type</FormLabel>
              <FormControl>
                <TransactionTypeSelect
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="text-base sm:text-sm"
                />
              </FormControl>
              <FormDescription className="text-xs">
                {transactionType === 'expense'
                  ? 'Enter the expense amount (e.g., 10.99)'
                  : transactionType === 'income'
                    ? 'Enter the income amount (e.g., 1000.00)'
                    : 'Enter the savings amount (e.g., 500.00)'}
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {showCategoryField && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Transaction description"
                  className="text-base sm:text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="datetime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Date and Time</FormLabel>
              <FormControl>
                <DateTimePicker value={field.value} onChange={field.onChange} className="w-full" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto mt-2">
          {isSubmitting ? 'Adding...' : `Add ${transactionType}`}
        </Button>
      </form>
    </Form>
  );
}
