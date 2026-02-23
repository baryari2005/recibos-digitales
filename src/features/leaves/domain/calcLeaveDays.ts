// src/features/leaves/domain/calcLeaveDays.ts
import { differenceInCalendarDays } from "date-fns";

export function calcLeaveDays(from: Date, returnDate: Date): number {
  if (returnDate <= from) return 0;

  return differenceInCalendarDays(returnDate, from);
}
