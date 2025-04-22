import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { format, addMonths, subMonths } from "date-fns";
import { Button } from "./ui/button";

interface MonthYearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function MonthYearPicker({ value, onChange, className }: MonthYearPickerProps) {
  const handlePrevMonth = () => {
    onChange(subMonths(value, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(value, 1));
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        aria-label="Previous month"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <div className="font-medium">
        {format(value, "MMMM yyyy")}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        aria-label="Next month"
        disabled={format(new Date(), "yyyy-MM") === format(value, "yyyy-MM")}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
} 