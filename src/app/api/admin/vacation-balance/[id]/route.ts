import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.res;

    const { id } = await params;
    const { totalDays } = await req.json();

    await prisma.vacationBalance.update({
      where: { id },
      data: { totalDays },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[UPDATE_VACATION_BALANCE]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.res;


    const { id } = await params;

    await prisma.vacationBalance.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[DELETE_VACATION_BALANCE]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}