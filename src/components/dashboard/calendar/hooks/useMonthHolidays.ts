// components/dashboard/calendar/hooks/useMonthHolidays.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { format as fmt } from "date-fns";
import { fetchHolidays, type Holiday } from "@/lib/holidays";

type HolidaySets = {
  any: Set<string>;
  inamovible: Set<string>;
  trasladable: Set<string>;
  puente: Set<string>;
};

export function useMonthHolidays(month: Date, country = "AR") {
  const [list, setList] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Año del mes visible (si tu grid muestra días de otro mes, igual no los pintamos)
        const year = month.getUTCFullYear();
        const data = await fetchHolidays(year, country);
        if (!alive) return;
        setList(data);
      } catch (e: any) {
        if (!alive) return;
        setError(String(e?.message ?? e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [month, country]);

  // Filtramos por el mes visible
  const monthKey = fmt(month, "yyyy-MM"); // p.ej. "2025-10"

  const { holidayByDate, sets } = useMemo(() => {
    const byDate = new Map<string, Holiday[]>();
    const sAny = new Set<string>();
    const sIna = new Set<string>();
    const sTra = new Set<string>();
    const sPue = new Set<string>();

    for (const h of list) {
      if (!h.date.startsWith(monthKey)) continue;
      const arr = byDate.get(h.date) ?? [];
      arr.push(h);
      byDate.set(h.date, arr);

      sAny.add(h.date);
      if (h.type === "puente") sPue.add(h.date);
      else if (h.type === "trasladable") sTra.add(h.date);
      else sIna.add(h.date); // default = inamovible u otros
    }

    const sets: HolidaySets = { any: sAny, inamovible: sIna, trasladable: sTra, puente: sPue };
    return { holidayByDate: byDate, sets };
  }, [list, monthKey]);

  return {
    loading,
    error,
    holidaySet: sets.any,  // compat con tu CalendarPanel actual
    holidayByDate,
    sets,                  // <— NUEVO: acceso por tipo
  };
}
