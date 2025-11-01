// src/lib/import-excel-helpers.ts
import * as XLSX from "xlsx";

export function StringOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export function nullifyEmpty(v: string | null) {
  return v && v.trim() ? v : null;
}

export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Normaliza diversas representaciones de fecha Excel → "YYYY-MM-DD" | null */
export function normalizeExcelDate(input: any): string | null {
  if (input == null || input === "") return null;

  // Caso 1: ya viene "YYYY-MM-DD"
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return toYmd(d);

    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d2 = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d2.getTime()) ? null : toYmd(d2);
    }
    return null;
  }

  // Caso 2: serial Excel
  if (typeof input === "number") {
    const d = XLSX.SSF.parse_date_code(input);
    if (!d || !d.y || !d.m || !d.d) return null;
    const js = new Date(d.y, d.m - 1, d.d);
    return isNaN(js.getTime()) ? null : toYmd(js);
  }

  // Caso 3: Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : toYmd(input);
  }

  return null;
}
