import { GroupedPayrollReceipts, StatusFilter } from "../types/payroll-receipt.types";


export type GetAllPayrollReceiptsInput = {
  search: string;
  status: StatusFilter;
  from: string | null;
  to: string | null;
};

export type GetAllPayrollReceiptsSummary = {
  totals: number;
  signed: number;
  disagreement: number;
  unsigned: number;
  coverage: string;
};

export type GetAllPayrollReceiptsOutput = {
  summary: GetAllPayrollReceiptsSummary;
  groups: GroupedPayrollReceipts[];
};