import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";
import { ListPendingLeavesUseCase } from "@/features/leaves/application/list-pending-leaves.usecase";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const loggedInUser = await requireAuth(req);

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const typeParam = searchParams.get("type");

    const type =
      typeParam === "VACACIONES" || typeParam === "OTHER"
        ? typeParam
        : undefined;

    if (type === "VACACIONES") {
      requirePermission(loggedInUser, "vacaciones", "aprobar");
    } else if (type === "OTHER") {
      requirePermission(loggedInUser, "licencias", "aprobar");
    } else {
      const canApproveVacations = loggedInUser.permisos?.some(
        (p) => p.modulo === "vacaciones" && p.accion === "aprobar"
      );

      const canApproveLicenses = loggedInUser.permisos?.some(
        (p) => p.modulo === "licencias" && p.accion === "aprobar"
      );

      if (!canApproveVacations && !canApproveLicenses) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }

    const repo = new LeaveRepository(prisma);
    const uc = new ListPendingLeavesUseCase(repo);

    const { items, total } = await uc.execute({
      q,
      page,
      pageSize,
      type,
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      console.error("GET /pending error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
  }
}