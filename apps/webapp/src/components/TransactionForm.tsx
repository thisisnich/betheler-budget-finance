import { evaluateExpression } from '@/lib/evaluateExpressions'; // Import the helper function
import { parseCurrencyInput } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { Link } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  initialType?: TransactionType;
  initialCategory?: string;
}

interface TransactionFormValues {
  amount: string;
  category: string;
  description: string;
  datetime: Date;
  transactionType: TransactionType;
  useAllocation?: boolean; // Added useAllocation field
}
export function TransactionForm({
  onSuccess,
  className,
  initialType = 'expense',
  initialCategory = 'Food',
}: TransactionFormProps) {
  const createTransaction = useSessionMutation(api.transactions.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createBudget = useSessionMutation(api.budgets.create);
  const splitIncomeByAllocations = useSessionMutation(api.allocation.splitIncomeByAllocations);
  const addToBudget = useSessionMutation(api.budgets.addToBudget);

  const form = useForm<TransactionFormValues>({
    defaultValues: {
      amount: '',
      category: initialCategory,
      description: '',
      datetime: new Date(),
      transactionType: initialType,
    },
  });

  const transactionType = form.watch('transactionType');
  const showCategoryField = transactionType === 'expense';
  const showAllocationField = transactionType === 'income';

  useEffect(() => {
    if (transactionType === 'income') {
      form.setValue('category', 'Income');
    } else if (transactionType === 'savings') {
      form.setValue('category', 'Savings');
    }
  }, [transactionType, form]);

  const onSubmit = useCallback(
    async (data: TransactionFormValues) => {
      try {
        setIsSubmitting(true);

        // Evaluate the expression entered in the amount field
        const amount = evaluateExpression(data.amount);

        if (amount === null || amount <= 0) {
          form.setError('amount', {
            message: 'Please enter a valid amount or expression',
          });
          return;
        }

        let category = data.category;
        if (data.transactionType === 'income') {
          category = 'Income';
        } else if (data.transactionType === 'savings') {
          category = 'Savings';
        }

        // If useAllocation is true and transactionType is income, split income into budgets
        if (data.transactionType === 'income' && data.useAllocation) {
          // Call the splitIncomeByAllocations query
          const allocations = await splitIncomeByAllocations({
            income: amount,
          });

          // Use the addToBudget API to update budgets with the allocated amounts
          for (const [budgetCategory, allocatedAmount] of Object.entries(allocations)) {
            await addToBudget({
              category: budgetCategory,
              amount: allocatedAmount,
              year: new Date().getFullYear(),
              month: new Date().getMonth(),
            });
          }
        }

        // Create the transaction
        await createTransaction({
          amount,
          category,
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
    [createTransaction, form, onSuccess, splitIncomeByAllocations, addToBudget]
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
                  placeholder="Enter a value or expression (e.g., 600+105)"
                  inputMode="decimal"
                  className="text-base sm:text-sm"
                />
              </FormControl>
              <FormDescription className="text-xs">
                {transactionType === 'expense'
                  ? 'Enter the expense amount (e.g., 10.99 or 10+5)'
                  : transactionType === 'income'
                    ? 'Enter the income amount (e.g., 1000.00 or 500*2)'
                    : 'Enter the savings amount (e.g., 500.00 or 1000/2)'}
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
        {showAllocationField && (
          <FormField
            control={form.control}
            name="useAllocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Use Allocation</FormLabel>
                <FormControl>
                  <Button
                    type="button"
                    variant={field.value ? 'default' : 'outline'}
                    onClick={() => field.onChange(!field.value)}
                    className="h-10 w-full sm:w-auto"
                  >
                    {field.value ? 'Enabled' : 'Disabled'}
                  </Button>
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
