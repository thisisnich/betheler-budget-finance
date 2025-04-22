import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  className,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date>(value);

  // Update the parent when the internal date changes, but avoid calling too frequently
  React.useEffect(() => {
    // Skip the initial render effect
    const isSameDate = date.getTime() === value.getTime();
    if (!isSameDate) {
      onChange(date);
    }
  }, [date, onChange, value]);

  // When the value prop changes from parent, update the internal state
  React.useEffect(() => {
    // Only update if the dates are actually different to avoid loops
    const isSameDate = date.getTime() === value.getTime();
    if (!isSameDate) {
      setDate(value);
    }
  }, [value, date]);

  // Handle time input changes with useCallback to prevent unnecessary re-renders
  const handleTimeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const timeString = e.target.value;
      const [hours, minutes] = timeString.split(':').map(Number);

      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date(date);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        setDate(newDate);
      }
    },
    [date]
  );

  // Handle date selection with useCallback
  const handleDateSelect = React.useCallback(
    (newDate: Date | undefined) => {
      if (newDate) {
        const updatedDate = new Date(newDate);
        // Preserve the time from the current date
        updatedDate.setHours(date.getHours());
        updatedDate.setMinutes(date.getMinutes());
        setDate(updatedDate);
      }
    },
    [date]
  );

  // Format the time string for the input - memoize this computation
  const timeString = React.useMemo(() => {
    return format(date, 'HH:mm');
  }, [date]);

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => {
                // Example: Disable future dates
                // return date > new Date();
                return false;
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center">
          <Input
            type="time"
            value={timeString}
            onChange={handleTimeChange}
            className="w-full"
            aria-label="Select time"
          />
        </div>
      </div>
    </div>
  );
}
