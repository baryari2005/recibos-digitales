// src/app/api/payroll/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "YYYY-MM" -> "MM-YYYY"
function toDisplayPeriod(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  return `${m}-${y}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodYYYYMM =
      searchParams.get("period") || new Date().toISOString().slice(0, 7);

    const me = await getServerMe(req);
    const userId = me?.user?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rawCuil = (me as any)?.user?.cuil || (me as any)?.user?.cuilNumero;

    if (!rawCuil) {
      return NextResponse.json(
        { error: "CUIL no configurado en tu perfil." },
        { status: 400 }
      );
    }

    const cuil = cuilDashed(rawCuil);       // "20-23177200-7"
    const period = toDisplayPeriod(periodYYYYMM); // "08-2025"

    const receipts = await prisma.payrollReceipt.findMany({
      where: { cuil, period, firmado: false },
      select: { id: true, fileUrl: true, filePath: true },
    });

    return NextResponse.json({
      ok: true,
      cuil,
      period,
      count: receipts.length,
      receipts, // por si después querés mostrar lista
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
