// components/dashboard/calendar/hooks/useNextHoliday.ts
"use client";

import { useEffect, useState } from "react";
import { fetchHolidays, type Holiday } from "@/lib/holidays";

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // 00:00 local
}

function fromYmdLocal(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1); // 00:00 local
}

type Kind = "inamovible" | "trasladable" | "puente" | undefined;

export type NextHoliday = {
  base?: { name: string; date: Date; type?: Kind };
  nonWorking?: { name: string; date: Date; type?: Kind };
  daysUntilNonWorking: number;
};

export function useNextHoliday(country = "AR") {
  const [data, setData] = useState<NextHoliday | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 👇 usar medianoche local (no UTC)
        const now = new Date();
        const todayLocal = startOfLocalDay(now);
        const year = todayLocal.getFullYear();

        const [list1, list2] = await Promise.all([
          fetchHolidays(year, country),
          fetchHolidays(year + 1, country),
        ]);

        const all: (Holiday & { dateObj: Date })[] = [...list1, ...list2]
          // 👇 parsear fecha como local (no "T00:00Z")
          .map(h => ({ ...h, dateObj: fromYmdLocal(h.date) }))
          // 👇 comparar contra el inicio del día local
          .filter(h => h.dateObj.getTime() >= todayLocal.getTime())
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        if (!alive) return;

        const base = all.find(h => h.type !== "puente");
        const bridge = all.find(
          h => h.type === "puente" && (!base || h.dateObj.getTime() <= base.dateObj.getTime())
        );
        const nonWorking = bridge ?? all[0];

        if (!nonWorking) {
          setData(null);
          return;
        }

        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        // Como ambas fechas son 00:00 local, el cociente es entero.
        const daysUntilNonWorking = Math.floor(
          (nonWorking.dateObj.getTime() - todayLocal.getTime()) / MS_PER_DAY
        );

        setData({
          base: base ? { name: base.name, date: base.dateObj, type: base.type as Kind } : undefined,
          nonWorking: { name: nonWorking.name, date: nonWorking.dateObj, type: nonWorking.type as Kind },
          daysUntilNonWorking,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [country]);

  return { data, loading };
}
