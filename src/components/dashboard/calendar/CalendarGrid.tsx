// components/dashboard/calendar/CalendarGrid.tsx
"use client";

import { getDate, isSameDay, format } from "date-fns";

const WEEK_LABELS = ["D", "L", "M", "M", "J", "V", "S"] as const;

type Props = {
  days: Date[];
  month: Date;
  holidaySet?: Set<string>;
  birthdaySet?: Set<string>;
  onDayClick?: (d: Date) => void; // <- lo vamos a usar
};

export function CalendarGrid({
  days,
  month,
  holidaySet,
  birthdaySet,
  onDayClick,
}: Props) {
  return (
    <div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
        {WEEK_LABELS.map((label, i) => (
          <div key={`${label}-${i}`} className="text-center py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          const inMonth = d.getMonth() === month.getMonth();
          const today = isSameDay(d, new Date());
          const key = format(d, "yyyy-MM-dd");
          const isHoliday = holidaySet?.has(key);
          const isBirthday = birthdaySet?.has(key);

          return (
            <button
              type="button"
              key={`${key}-${idx}`}
              onClick={() => onDayClick?.(d)}        // <-- dispara el click
              className={`aspect-video rounded-md border relative text-sm
                ${inMonth ? "bg-white" : "bg-muted/40 text-muted-foreground"}
                ${today ? "ring-2 ring-indigo-600" : ""}
                hover:bg-muted/50 transition cursor-pointer flex items-center justify-center`}
              title={isHoliday ? "Feriado" : undefined}
              aria-label={`Día ${getDate(d)}`}
            >
              <span className="absolute top-1 right-1 text-[11px]">{getDate(d)}</span>

              {/* marcadores */}
              <div className="absolute bottom-1 left-1 flex gap-1">
                {isHoliday && <span className="h-1.5 w-1.5 rounded-full bg-red-600" />}
                {isBirthday && <span className="h-1.5 w-1.5 rounded-full bg-green-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
