// components/dashboard/calendar/hooks/useMonthHolidays.ts
"use client";
import { useEffect, useMemo, useState } from "react";

type Holiday = { date: string; name: string };

export function useMonthHolidays(month: Date, country = "AR") {
  const [items, setItems] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const year = month.getFullYear();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/holidays?year=${year}&country=${country}`, { cache: "force-cache" });
        const data: Holiday[] = await res.json();
        if (!res.ok) throw new Error((data as any)?.message || "Error al cargar feriados");
        if (alive) setItems(data);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [year, country]);

  // Mapa y set (solo del mes visible)
  const monthStr = String(month.getMonth() + 1).padStart(2, "0");
  const holidaySet = useMemo(() => {
    const s = new Set<string>();
    for (const h of items) {
      if (h.date.slice(5, 7) === monthStr) s.add(h.date);
    }
    return s;
  }, [items, monthStr]);

  const holidayByDate = useMemo(() => {
    const m = new Map<string, Holiday[]>();
    for (const h of items) {
      if (h.date.slice(5, 7) === monthStr) {
        if (!m.has(h.date)) m.set(h.date, []);
        m.get(h.date)!.push(h);
      }
    }
    return m;
  }, [items, monthStr]);

  return { holidaySet, holidayByDate, loading, error: error };
}

