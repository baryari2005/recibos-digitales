// src/lib/holidays.ts
export type Holiday = { date: string; name: string };

export async function fetchHolidays(year: number, country = "AR"): Promise<Holiday[]> {
  const res = await fetch(`/api/holidays?year=${year}&country=${country}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudieron obtener los feriados");
  return res.json();
}

export function holidaysToSet(list: Holiday[]): Set<string> {
  return new Set(list.map(h => h.date)); // Set("YYYY-MM-DD")
}
