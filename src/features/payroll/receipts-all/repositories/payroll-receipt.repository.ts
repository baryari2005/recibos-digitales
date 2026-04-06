import type { ReceiptSlim, UserSlim } from "../types/payroll-receipt.types";

export type FindPayrollReceiptsFilters = {
  search?: string;
  cuilDigits?: string;
  matchedCuils?: string[];
  fromDate?: Date | null;
  toDate?: Date | null;
  status?: "all" | "signed" | "unsigned" | "disagreement";
};

export interface PayrollReceiptRepository {
  findMatchedUserCuils(params: {
    search: string;
    cuilDigits: string;
  }): Promise<string[]>;

  findReceipts(filters: FindPayrollReceiptsFilters): Promise<ReceiptSlim[]>;

  findUsersByCuils(cuils: string[]): Promise<UserSlim[]>;
}