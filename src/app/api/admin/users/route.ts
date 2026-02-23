import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);

  if (!["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user.rol.nombre)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
