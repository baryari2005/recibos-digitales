import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/server-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const loggedInUser = await requireAuth(req);
    requirePermission(loggedInUser, "vacaciones", "asignar");

    const { id } = await params;
    const { totalDays } = await req.json();

    await prisma.vacationBalance.update({
      where: { id },
      data: { totalDays },
    });

    return NextResponse.json({ ok: true });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error?.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const loggedInUser = await requireAuth(req);
    requirePermission(loggedInUser, "vacaciones", "asignar");

    const { id } = await params;

    await prisma.vacationBalance.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error?.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}