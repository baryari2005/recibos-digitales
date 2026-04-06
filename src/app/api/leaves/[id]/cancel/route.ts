import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const loggedInUser = await requireAuth(req);
    requirePermission(loggedInUser, "vacaciones", "cancelar");

    const userId = loggedInUser.id;

    const { id: leaveId } = await context.params;

    const repo = new LeaveRepository(prisma);
    const leave = await repo.findById(leaveId);

    if (!leave || leave.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (leave.status !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Cannot cancel this leave" },
        { status: 400 }
      );
    }

    await repo.cancel(leaveId);

    return NextResponse.json({ ok: true });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error?.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(
        { error: error?.message || "Error" },
        { status: 400 }
      );
    }
  }
}
