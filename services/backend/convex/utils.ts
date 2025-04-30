/**
 * Utility functions for the Convex backend
 */

/**
 * Get the first day of a month at 00:00:00.000
 * @param year The full year (e.g., 2023)
 * @param month The month (0-based, 0 = January, 11 = December)
 * @returns Date object set to the first day of the month at 00:00:00.000
 */
export function getMonthStartDate(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get the last day of a month at 23:59:59.999
 * @param year The full year (e.g., 2023)
 * @param month The month (0-based, 0 = January, 11 = December)
 * @returns Date object set to the last day of the month at 23:59:59.999
 */
export function getMonthEndDate(year: number, month: number): Date {
  // Create a date for the first day of the next month
  const nextMonth = new Date(year, month + 1, 1);

  // Subtract 1 millisecond to get the last millisecond of the current month
  nextMonth.setMilliseconds(-1);

  return nextMonth;
}

/**
 * Get the ISO string representation for the start of a month
 * @param year The full year (e.g., 2023)
 * @param month The month (0-based, 0 = January, 11 = December)
 * @returns ISO string for the first millisecond of the month
 */
export function getMonthStartDateISO(year: number, month: number): string {
  return getMonthStartDate(year, month).toISOString();
}

/**
 * Get the ISO string representation for the end of a month
 * @param year The full year (e.g., 2023)
 * @param month The month (0-based, 0 = January, 11 = December)
 * @returns ISO string for the last millisecond of the month
 */
export function getMonthEndDateISO(year: number, month: number): string {
  return getMonthEndDate(year, month).toISOString();
}

/**
 * Create date range object with start and end dates for a month
 * @param year The full year (e.g., 2023)
 * @param month The month (0-based, 0 = January, 11 = December)
 * @returns Object with startDate, endDate, startDateISO, and endDateISO
 */
export function getMonthDateRange(
  year: number,
  month: number
): {
  startDate: Date;
  endDate: Date;
  startDateISO: string;
  endDateISO: string;
} {
  const startDate = getMonthStartDate(year, month);
  const endDate = getMonthEndDate(year, month);

  return {
    startDate,
    endDate,
    startDateISO: startDate.toISOString(),
    endDateISO: endDate.toISOString(),
  };
}
