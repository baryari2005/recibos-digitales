// lib/repos/payrollReceipts.ts
import { prisma } from "@/lib/db";

export type ReceiptUpsertInput = {
  cuilDashed: string;         // ej. "20-23177200-7"
  periodYYYYMM: string;       // ej. "2025-08"
  filePath: string;           // ej. "payroll/2025-08/20-23177200-7.pdf" (¡sin el nombre del bucket!)
  fileUrl: string;            // URL pública completa
};

// "2025-08" -> "08-2025"
function toDisplayPeriod(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  return `${m}-${y}`;
}

// 1° día del mes (para ordenar/filtrar)
function toPeriodDateUtc(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
}

export async function upsertPayrollReceipt(input: ReceiptUpsertInput) {
  const period = toDisplayPeriod(input.periodYYYYMM);
  const periodDate = toPeriodDateUtc(input.periodYYYYMM);

  return prisma.payrollReceipt.upsert({
    where: { cuil_period: { cuil: input.cuilDashed, period } },
    update: {
      filePath: input.filePath,
      fileUrl: input.fileUrl,
    },
    create: {
      cuil: input.cuilDashed,
      period,
      periodDate,
      filePath: input.filePath,
      fileUrl: input.fileUrl,
      // firmado / firmadoEnDesconformidad quedan en false por defecto
    },
  });
}
