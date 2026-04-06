import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const loggedInUser = await requireAuth(req);
  requirePermission(loggedInUser, "vacaciones", "asignar");

  const year = new Date().getFullYear();

  const users = await prisma.usuario.findMany({
    select: { id: true },
  });

  for (const u of users) {
    await prisma.vacationBalance.upsert({
      where: {
        userId_year: {
          userId: u.id,
          year,
        },
      },
      update: {},
      create: {
        userId: u.id,
        year,
        totalDays: 14, // 👈 default configurable
      },
    });
  }

  return NextResponse.json({ ok: true });
}
