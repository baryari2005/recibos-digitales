import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeaveStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(
  req: NextRequest,
  { params }: Ctx
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.res;

    const userId = auth.me?.user?.id;

    const { id } = await params;
    const { reason } = await req.json();

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (leave.status !== LeaveStatus.PENDIENTE) {
      return NextResponse.json(
        { error: "Already processed" },
        { status: 400 }
      );
    }

    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.RECHAZADO,
        note: reason,
        approverId: userId,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
