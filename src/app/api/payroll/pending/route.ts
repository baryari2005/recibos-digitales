// src/app/api/payroll/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServerMeUser = {
  id?: string | null;
  cuil?: string | null;
  cuilNumero?: string | null;
};

function getSafeUser(value: unknown): ServerMeUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (!("user" in value)) {
    return null;
  }

  const user = (value as { user?: unknown }).user;

  if (!user || typeof user !== "object") {
    return null;
  }

  const candidate = user as Record<string, unknown>;

  return {
    id: typeof candidate.id === "string" ? candidate.id : null,
    cuil: typeof candidate.cuil === "string" ? candidate.cuil : null,
    cuilNumero:
      typeof candidate.cuilNumero === "string"
        ? candidate.cuilNumero
        : null,
  };
}

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
    const user = getSafeUser(me);

    const userId = me?.user?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rawCuil = user?.cuil || user?.cuilNumero;

    if (!rawCuil) {
      return NextResponse.json(
        { error: "CUIL no configurado en tu perfil." },
        { status: 400 }
      );
    }

    const cuil = cuilDashed(rawCuil);       // "20-23177200-7"
    const period = toDisplayPeriod(periodYYYYMM); // "08-2025"

    const receipts = await prisma.payrollReceipt.findMany({
      where: { cuil, period, signed: false },
      select: { id: true, fileUrl: true, filePath: true },
    });

    return NextResponse.json({
      ok: true,
      cuil,
      period,
      count: receipts.length,
      receipts, // por si después querés mostrar lista
    });
  } catch (error: unknown) {
    if (error instanceof Error) {      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
