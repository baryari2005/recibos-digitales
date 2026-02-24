import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

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
