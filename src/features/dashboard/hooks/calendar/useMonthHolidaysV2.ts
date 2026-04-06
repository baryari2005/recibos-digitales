"use client";

import { useEffect, useMemo, useState } from "react";

type Holiday = {
  date: string;
  name: string;
};

function getErrorMessage(
  data: unknown,
  fallback = "Error al cargar feriados"
): string {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

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
        const res = await fetch(
          `/api/holidays?year=${year}&country=${country}`,
          { cache: "force-cache" }
        );

        const data: unknown = await res.json();

        if (!res.ok) {
          throw new Error(
            getErrorMessage(data, "Error al cargar feriados")
          );
        }

        if (alive) {
          setItems(Array.isArray(data) ? (data as Holiday[]) : []);
        }
      } catch (error: unknown) {
        if (alive) {
          setErr(
            error instanceof Error ? error.message : "Error"
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [year, country]);

  const monthStr = String(month.getMonth() + 1).padStart(2, "0");

  const holidaySet = useMemo(() => {
    const s = new Set<string>();

    for (const h of items) {
      if (h.date.slice(5, 7) === monthStr) {
        s.add(h.date);
      }
    }

    return s;
  }, [items, monthStr]);

  const holidayByDate = useMemo(() => {
    const m = new Map<string, Holiday[]>();

    for (const h of items) {
      if (h.date.slice(5, 7) === monthStr) {
        if (!m.has(h.date)) {
          m.set(h.date, []);
        }

        m.get(h.date)!.push(h);
      }
    }

    return m;
  }, [items, monthStr]);

  return { holidaySet, holidayByDate, loading, error };
}