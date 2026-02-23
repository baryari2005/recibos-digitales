import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/server-auth";
import { VacationBalance } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const year = new Date().getFullYear();

    const balances = await prisma.vacationBalance.findMany({
      where: {
        userId: user.id,
        year: { lte: year },
      },
      orderBy: { year: "asc" },
    });

    const total = balances.reduce(
      (acc: number, b: VacationBalance) => acc + b.totalDays,
      0
    );

    const used = balances.reduce(
      (acc: number, b: VacationBalance) => acc + b.usedDays,
      0
    );

    return NextResponse.json({
      total,
      used,
      available: Math.max(total - used, 0),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
