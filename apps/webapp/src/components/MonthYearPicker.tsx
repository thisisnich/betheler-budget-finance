import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface MonthYearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function MonthYearPicker({
  value,
  onChange,
  className,
}: MonthYearPickerProps) {
  const handlePrevMonth = () => {
    onChange(subMonths(value, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(value, 1));
  };

  // Get current date to disable next month button if current month is selected
  const isCurrentMonth =
    format(new Date(), 'yyyy-MM') === format(value, 'yyyy-MM');

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        aria-label="Previous month"
        className="h-8 w-8 sm:h-9 sm:w-9"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <div className="font-medium text-sm sm:text-base">
        {format(value, 'MMMM yyyy')}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        aria-label="Next month"
        disabled={isCurrentMonth}
        className="h-8 w-8 sm:h-9 sm:w-9"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
