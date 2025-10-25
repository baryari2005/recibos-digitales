// components/dashboard/calendar/hooks/useNextHoliday.ts
"use client";

import { useEffect, useState } from "react";
import { fetchHolidays, type Holiday } from "@/lib/holidays";

function ymdUtc(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromYmdUtc(s: string) {
  return new Date(`${s}T00:00:00.000Z`);
}

type Kind = "inamovible" | "trasladable" | "puente" | undefined;

export type NextHoliday = {
  base?: { name: string; date: Date; type?: Kind };            // p.ej. 24/11 Soberanía
  nonWorking?: { name: string; date: Date; type?: Kind };       // p.ej. 21/11 Puente
  daysUntilNonWorking: number;                                  // contador hasta el no laborable
};

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

        const [list1, list2] = await Promise.all([
          fetchHolidays(year, country),
          fetchHolidays(year + 1, country),
        ]);
        const all: (Holiday & { dateObj: Date })[] = [...list1, ...list2]
          .map(h => ({ ...h, dateObj: fromYmdUtc(h.date) }))
          .filter(h => h.dateObj.getTime() >= todayUtc.getTime())
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        if (!alive) return;

        const base = all.find(h => h.type !== "puente"); // el feriado “causa”
        // puente más cercano que ocurra antes (o el mismo día) del base
        const bridge = all.find(h => h.type === "puente" && (!base || h.dateObj <= base.dateObj));
        // el próximo no laborable es el primero en el tiempo (si hay puente antes, gana)
        const nonWorking = bridge ?? all[0];

        if (!nonWorking) {
          setData(null);
          return;
        }

        const msPerDay = 24 * 60 * 60 * 1000;
        const daysUntilNonWorking = Math.round((nonWorking.dateObj.getTime() - todayUtc.getTime()) / msPerDay);

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
