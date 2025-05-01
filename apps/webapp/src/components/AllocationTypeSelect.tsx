import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const ALLOCATION_TYPES = [
  { value: 'amount', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'overflow', label: 'Overflow Percentage' },
];

interface AllocationTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function AllocationTypeSelect({
  value,
  onChange,
  className,
  disabled,
}: AllocationTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Select allocation type" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-[300px]" sideOffset={4}>
        {ALLOCATION_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value} className="py-2.5 cursor-pointer">
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
