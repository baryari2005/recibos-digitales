// src/app/api/admin/leaves/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/server-auth";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";
import { ListPendingLeavesUseCase } from "@/features/leaves/application/list-pending-leaves.usecase";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (!["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user.rol.nombre)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const typeParam = searchParams.get("type");

    const type =
      typeParam === "VACACIONES" || typeParam === "OTHER"
        ? typeParam
        : undefined;

    const repo = new LeaveRepository(prisma);
    const uc = new ListPendingLeavesUseCase(repo);

    const { items, total } = await uc.execute({
      q,
      page,
      pageSize,
      type
    });

    return NextResponse.json({
      data: items,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      },
    });
  } catch (e: any) {
    console.error("[admin/leaves/pending] ERROR:", e);
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
