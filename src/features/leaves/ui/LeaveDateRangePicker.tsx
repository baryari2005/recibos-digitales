"use client";

import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { differenceInCalendarDays, parseISO, addDays, format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";

type Holiday = {
  date: string; // yyyy-mm-dd
  name: string;
};

type Props = {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;

  // ✅ NUEVO: para saber si estamos calculando vacaciones
  type?: string;

  // ✅ NUEVO: avisarle al padre cuántos días da el cálculo
  onDaysChange?: (days: number) => void;
};

// ✅ NUEVO: cuenta días desde from (incl) hasta returnDate (excl),
// excluyendo domingos y feriados.
function calcVacationDays(from: Date, returnDate: Date, holidaySet: Set<string>) {
  if (returnDate <= from) return 0;

  let count = 0;
  for (let d = from; d < returnDate; d = addDays(d, 1)) {
    // 0 = domingo
    if (d.getDay() === 0) continue;

    const ymd = format(d, "yyyy-MM-dd");
    if (holidaySet.has(ymd)) continue;

    count++;
  }
  return count;
}

export function LeaveDateRangePicker({ value, onChange, type, onDaysChange }: Props) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [month, setMonth] = useState<Date>(value?.from ?? new Date());

  // ✅ Traer feriados del año del mes visible (y también del año del rango si cambia)
  useEffect(() => {
    const years = new Set<number>();
    years.add(month.getFullYear());
    if (value?.from) years.add(value.from.getFullYear());
    if (value?.to) years.add(value.to.getFullYear());

    let cancelled = false;

    (async () => {
      try {
        const all: Holiday[] = [];

        for (const y of Array.from(years)) {
          const r = await fetch(`/api/holidays?year=${y}&country=AR`);
          const data = (await r.json()) as Holiday[];
          all.push(...data);
        }

        if (!cancelled) setHolidays(all);
      } catch {
        if (!cancelled) setHolidays([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [month, value?.from, value?.to]);

  const holidaySet = useMemo(() => new Set(holidays.map((h) => h.date)), [holidays]);

  // tu regla actual: “el día de regreso no se contabiliza”
  const isInvalidRange =
    value?.from &&
    value?.to &&
    differenceInCalendarDays(value.to, value.from) <= 0;

  const totalDays = useMemo(() => {
    if (!value?.from || !value?.to || isInvalidRange) return 0;

    // ✅ VACACIONES: excluir domingos + feriados
    if (type === "VACACIONES") {
      return calcVacationDays(value.from, value.to, holidaySet);
    }

    // ✅ Otras licencias: como estaba
    return differenceInCalendarDays(value.to, value.from);
  }, [value?.from, value?.to, isInvalidRange, type, holidaySet]);

  // ✅ avisar al padre para que use este totalDays en submit()
  useEffect(() => {
    onDaysChange?.(totalDays);
  }, [totalDays, onDaysChange]);

  const holidayDates = useMemo(
    () => holidays.map((h) => parseISO(h.date)),
    [holidays]
  );

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={1}
        locale={es}
        month={month}
        onMonthChange={setMonth}
        disabled={(date) => date < new Date()}
        modifiers={{ holiday: holidayDates }}
        modifiersClassNames={{ holiday: "text-red-600 font-semibold" }}
        className="scale-100 rounded border"
      />

      {isInvalidRange && (
        <p className="text-sm text-red-600 text-center">
          El día de regreso debe ser posterior al inicio de la licencia
        </p>
      )}

      {totalDays > 0 && !isInvalidRange && (
        <p className="text-center text-sm font-medium mt-4">
          Se registrarán{" "}
          <span className="font-bold">{totalDays}</span> días a su saldo
        </p>
      )}
    </div>
  );
}