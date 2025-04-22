import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

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
  }, [date]);
  
  // When the value prop changes from parent, update the internal state
  React.useEffect(() => {
    // Only update if the dates are actually different to avoid loops
    const isSameDate = date.getTime() === value.getTime();
    if (!isSameDate) {
      setDate(value);
    }
  }, [value]);
  
  // Handle time input changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    const [hours, minutes] = timeString.split(":").map(Number);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setDate(newDate);
    }
  };
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={format(date, "HH:mm")}
        onChange={handleTimeChange}
        className="w-full"
      />
    </div>
  );
} 