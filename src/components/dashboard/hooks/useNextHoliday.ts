"use client";

import { useEffect, useState } from "react";
import { fetchHolidays, type Holiday } from "@/lib/holidays";

type NextHoliday = { name: string; date: Date; daysUntil: number };

function ymdUtc(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromYmdUtc(s: string) {
  // fecha a medianoche UTC para evitar drift
  return new Date(`${s}T00:00:00.000Z`);
}

export function useNextHoliday(country = "AR") {
  const [data, setData] = useState<NextHoliday | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const now = new Date();
        const todayUtc = fromYmdUtc(ymdUtc(now));
        const year = now.getUTCFullYear();

        // pedimos este año + el próximo (por si ya estamos a fin de año)
        const [list1, list2] = await Promise.all([
          fetchHolidays(year, country),
          fetchHolidays(year + 1, country),
        ]);
        const all: Holiday[] = [...list1, ...list2];

        const next = all
          .map((h) => ({ ...h, dateObj: fromYmdUtc(h.date) }))
          .filter((h) => h.dateObj.getTime() >= todayUtc.getTime())
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

        if (!alive) return;
        if (!next) {
          setData(null);
        } else {
          const msPerDay = 24 * 60 * 60 * 1000;
          const daysUntil = Math.round(
            (next.dateObj.getTime() - todayUtc.getTime()) / msPerDay
          );
          setData({ name: next.name, date: next.dateObj, daysUntil });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [country]);

  return { data, loading };
}
