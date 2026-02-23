import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);

    const { id: leaveId } = await context.params;

    const repo = new LeaveRepository(prisma);
    const leave = await repo.findById(leaveId);

    if (!leave || leave.userId !== user.id) {
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
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: e?.message || "Error" },
      { status: 400 }
    );
  }
}
