import { differenceInCalendarDays } from "date-fns";

export function calcDaysInclusive(from: Date, to: Date): number {
  if (to < from) return 0;
  return differenceInCalendarDays(to, from) + 1;
}
