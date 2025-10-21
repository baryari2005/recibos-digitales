// lib/payroll/period.ts
export function toDisplayPeriod(yyyyMm: string) {
  // "2025-08" -> "08-2025"
  const [y, m] = yyyyMm.split("-");
  return `${m}-${y}`;
}

export function toPeriodDateUtc(yyyyMm: string) {
  // 1er día del mes en UTC
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
}
