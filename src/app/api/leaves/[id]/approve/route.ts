import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeaveStatus, LeaveType, Prisma } from "@prisma/client";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const loggedInUser = await requireAuth(req);
    requirePermission(loggedInUser, "vacaciones", "aprobar");

    const userId = loggedInUser.id;
    const { id } = await context.params;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const leave = await tx.leaveRequest.findUnique({
        where: { id },
      });

      if (!leave) {
        throw new Error("NOT_FOUND");
      }

      if (leave.status !== LeaveStatus.PENDIENTE) {
        throw new Error("ALREADY_PROCESSED");
      }

      if (leave.type === LeaveType.VACACIONES) {
        let remainingDays = leave.daysCount;

        const balances = await tx.vacationBalance.findMany({
          where: {
            userId: leave.userId,
            deletedAt: null,
          },
          orderBy: {
            year: "asc",
          },
        });

        const totalAvailable = balances.reduce((acc, balance) => {
          return acc + (balance.totalDays - balance.usedDays);
        }, 0);

        if (totalAvailable < leave.daysCount) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        for (const balance of balances) {
          const available = balance.totalDays - balance.usedDays;

          if (available <= 0) continue;

          const toUse = Math.min(available, remainingDays);

          await tx.vacationBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: {
                increment: toUse,
              },
            },
          });

          remainingDays -= toUse;

          if (remainingDays <= 0) break;
        }
      }

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveStatus.APROBADO,
          approverId: userId,
          decidedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (error.message === "NOT_FOUND") {
        return NextResponse.json(
          { error: "Solicitud no encontrada" },
          { status: 404 }
        );
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          { error: "El empleado no tiene saldo suficiente" },
          { status: 400 }
        );
      }

      if (error.message === "ALREADY_PROCESSED") {
        return NextResponse.json(
          { error: "La solicitud ya fue procesada" },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}