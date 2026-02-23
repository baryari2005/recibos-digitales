import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/server-auth";
import { LeaveStatus, LeaveType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");

    const roleName = user?.rol?.nombre ?? "";
    const isAdmin = ["ADMIN", "RRHH", "ADMINISTRADOR"].includes(roleName);

    const where: any = {
      status: LeaveStatus.PENDIENTE,
    };

    // 🔐 Si NO es admin → solo sus propias solicitudes
    if (!isAdmin) {
      where.userId = user.id;
    }

    // 🔎 Filtro por tipo
    if (typeParam === "VACACIONES") {
      where.type = LeaveType.VACACIONES;
    }

    if (typeParam === "OTHER") {
      where.type = { not: LeaveType.VACACIONES };
    }

    const count = await prisma.leaveRequest.count({ where });

    return NextResponse.json({ count });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
