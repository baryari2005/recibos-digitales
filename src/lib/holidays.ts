export type Holiday = {
  date: string;                 // "YYYY-MM-DD"
  name: string;
  type?: "inamovible" | "trasladable" | "puente";
};

export async function fetchHolidays(year: number, country = "AR"): Promise<Holiday[]> {
  const url = `/api/holidays?year=${year}&country=${country}`;
  const res = await fetch(
    url, {
    method: "GET",
    cache: "no-store",
    headers: { accept: "application/json" }
  });

  if (!res.ok)
    throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as Holiday[];
}