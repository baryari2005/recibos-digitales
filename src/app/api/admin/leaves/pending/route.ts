// src/app/api/admin/leaves/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";
import { ListPendingLeavesUseCase } from "@/features/leaves/application/list-pending-leaves.usecase";
import { requireAdmin } from "@/lib/authz";

export async function GET(req: NextRequest) {
  try {    
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.res;

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
