// components/dashboard/calendar/hooks.ts
"use client";

import { useMemo } from "react";
import { endOfMonth, getDate, getDay, startOfMonth } from "date-fns";

export function useCalendarDays(month: Date) {
  return useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const result: Date[] = [];
    const leading = getDay(start); // domingo=0 => encaja con tus labels D L M M J V S

    for (let i = 0; i < leading; i++) {
      result.push(new Date(start.getFullYear(), start.getMonth(), i - leading + 1));
    }
    for (let d = 1; d <= getDate(end); d++) {
      result.push(new Date(start.getFullYear(), start.getMonth(), d));
    }
    while (result.length % 7 !== 0) {
      const last = result[result.length - 1];
      result.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
    }
    return result;
  }, [month]);
}
