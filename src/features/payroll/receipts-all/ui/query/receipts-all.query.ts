import type { NextRequest } from "next/server";
import { GetAllPayrollReceiptsInput } from "../../dto/get-all-payroll-receipts.dto";
import { StatusFilter } from "../../types/payroll-receipt.types";

export function parseReceiptsAllQuery(
  req: NextRequest
): GetAllPayrollReceiptsInput {
  const url = new URL(req.url);

  return {
    search: (url.searchParams.get("q") ?? "").trim(),
    status: (url.searchParams.get("status") as StatusFilter) || "all",
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  };
}