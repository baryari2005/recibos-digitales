export function parseMonthToDateStart(value?: string | null): Date | null {
  if (!value) return null;

  const raw = value.trim();
  if (!raw) return null;

  let year: number;
  let month: number;

  if (/^\d{4}-\d{2}$/.test(raw)) {
    year = Number(raw.slice(0, 4));
    month = Number(raw.slice(5, 7));
  } else if (/^\d{2}-\d{4}$/.test(raw)) {
    month = Number(raw.slice(0, 2));
    year = Number(raw.slice(3, 7));
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getMonthEndUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  );
}