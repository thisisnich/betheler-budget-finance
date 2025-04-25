import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Common transaction categories
const TRANSACTION_CATEGORIES = [
  'Food',
  'Transportation',
  'Tithe & Offering',
  'Bills & Utilities',
  'Entertainment',
  'Shopping',
  'Personal',
  'Gifts',
  'Income',
  'Other',
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, className, disabled }: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-[300px]" sideOffset={4}>
        {TRANSACTION_CATEGORIES.map((category) => (
          <SelectItem key={category} value={category} className="py-2.5 cursor-pointer">
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
