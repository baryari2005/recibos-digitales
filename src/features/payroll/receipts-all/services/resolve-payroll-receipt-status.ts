import type { ReceiptSlim, ReceiptStatus } from "../types/payroll-receipt.types";

export function resolvePayrollReceiptStatus(
  receipt: ReceiptSlim
): ReceiptStatus {
  if (receipt.signedDisagreement) return "DISCONFORMIDAD";
  if (receipt.signed) return "FIRMADO";
  return "PENDIENTE";
}