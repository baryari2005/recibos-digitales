import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const loggedInUser = await requireAuth(req);
  requirePermission(loggedInUser, "usuarios", "ver");

  const users = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      legajo: {
        select: { numeroLegajo: true },
      },
    },
    orderBy: { apellido: "asc" },
  });

  return NextResponse.json({ data: users });
}
