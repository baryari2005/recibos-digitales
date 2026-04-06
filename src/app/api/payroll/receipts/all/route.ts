import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { parseReceiptsAllQuery } from "@/features/payroll/receipts-all/ui/query/receipts-all.query";
import { PrismaPayrollReceiptRepository } from "@/features/payroll/receipts-all/infrastructure/repositories/prisma-payroll-receipt.repository";
import { getAllPayrollReceiptsService } from "@/features/payroll/receipts-all/application/services/get-all-payroll-receipts.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const loggedInUser = await requireAuth(req);
  requirePermission(loggedInUser, "recibos", "seguimiento");

  const query = parseReceiptsAllQuery(req);
  const repository = new PrismaPayrollReceiptRepository();

  const result = await getAllPayrollReceiptsService(query, repository);

  return NextResponse.json(result);
}