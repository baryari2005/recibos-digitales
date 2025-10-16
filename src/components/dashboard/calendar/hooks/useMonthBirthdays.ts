// components/dashboard/calendar/hooks/useMonthBirthdays.ts
"use client";

import { useEffect, useMemo, useState } from "react";

export type BirthdayRow = {
  userId: string;
  fullName: string;
  date: string; // "YYYY-MM-DD"
};

function yyyymm(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function useMonthBirthdays(month: Date) {
  const [rows, setRows] = useState<BirthdayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ym = yyyymm(month);                // "2025-10"
        const url = `/api/birthdays?month=${ym}`; // tu route acepta month=YYYY-MM
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "fetch_failed");
        const list: BirthdayRow[] = json.items ?? json; // por si devolvés array directo
        if (alive) setRows(list);
      } catch (e: any) {
        if (alive) setError(e?.message || "fetch_failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [month]);

  // Set con “YYYY-MM-DD” para puntear el calendario
  const birthdaySet = useMemo(() => new Set(rows.map(r => r.date)), [rows]);

  // Mapa por fecha: "YYYY-MM-DD" -> filas
  const birthdaysByDate = useMemo(() => {
    const m = new Map<string, BirthdayRow[]>();
    for (const r of rows) {
      const arr = m.get(r.date) ?? [];
      arr.push(r);
      m.set(r.date, arr);
    }
    return m;
  }, [rows]);

  return { rows, birthdaySet, birthdaysByDate, loading, error };
}
