"use client";

import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { differenceInCalendarDays, parseISO } from "date-fns";

import { Calendar } from "@/components/ui/calendar";

type Holiday = {
  date: string; // yyyy-mm-dd
  name: string;
};

type Props = {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
};

export function LeaveDateRangePicker({ value, onChange }: Props) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  /* =========================
     Traer feriados del año visible
  ========================== */
  useEffect(() => {
    const year = new Date().getFullYear();

    fetch(`/api/holidays?year=${year}&country=AR`)
      .then((r) => r.json())
      .then(setHolidays)
      .catch(() => setHolidays([]));
  }, []);

  /* =========================
     Helpers
  ========================== */
  const holidayDates = useMemo(
    () => holidays.map((h) => parseISO(h.date)),
    [holidays]
  );

  const totalDays =
    value?.from && value?.to
      ? differenceInCalendarDays(value.to, value.from)
      : 0;

  const isInvalidRange =
    value?.from &&
    value?.to &&
    differenceInCalendarDays(value.to, value.from) <= 0;

  const holidaysInRange = useMemo(() => {
    if (!value?.from || !value?.to) return [];

    const from = value.from;
    const to = value.to;

    return holidays.filter((h) => {
      const d = parseISO(h.date);
      return d >= from && d <= to;
    });
  }, [value, holidays]);

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      {/* Calendario */}
      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={1}
        locale={es}
        disabled={(date) => date < new Date()}
        modifiers={{
          holiday: holidayDates,
        }}
        modifiersClassNames={{
          holiday: "text-red-600 font-semibold",
        }}
        className="scale-100 rounded border"
      />

      {isInvalidRange && (
        <p className="text-sm text-red-600 text-center">
          El día de regreso debe ser posterior al inicio de la licencia
        </p>
      )}

      {/* Total de días */}
      {totalDays > 0 && !isInvalidRange && (
        <p className="text-center text-sm font-medium mt-4">
          Se registrarán{" "}
          <span className="font-bold">{totalDays}</span> días a su saldo
        </p>
      )}

      {/* Feriados dentro del rango */}
      {/*
      {holidaysInRange.length > 0 && (
        <div className="text-sm text-muted-foreground text-center space-y-1">
          {holidaysInRange.map((h) => (
            <p key={h.date}>
              🎉 {format(parseISO(h.date), "dd/MM")} – {h.name}
            </p>
          ))}
        </div>
      )}
      */}
    </div>
  );
}
