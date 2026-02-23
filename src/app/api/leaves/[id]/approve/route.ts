// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { requireAuth } from "@/lib/server-auth";
// import { LeaveStatus } from "@prisma/client";

// export async function POST(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = await requireAuth(req);

//     if (!["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user.rol.nombre)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const { id } = await context.params; // 👈 CLAVE

//     const leave = await prisma.leaveRequest.findUnique({
//       where: { id },
//     });

//     if (!leave) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     if (leave.status !== "PENDIENTE") {
//       return NextResponse.json(
//         { error: "Already processed" },
//         { status: 400 }
//       );
//     }

//     await prisma.leaveRequest.update({
//       where: { id },
//       data: {
//         status: LeaveStatus.APROBADO,
//         approverId: user.id,
//         decidedAt: new Date(),
//       },
//     });

//     return NextResponse.json({ ok: true });
//   } catch (e: any) {
//     if (e?.message === "UNAUTHORIZED") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     console.error("[APPROVE_LEAVE_ERROR]", e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/server-auth";
import { LeaveStatus, LeaveType, Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);

    if (!["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user.rol.nombre)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

        // 🔥 Traemos todos los balances con disponibles
        const balances = await tx.vacationBalance.findMany({
          where: {
            userId: leave.userId,
            deletedAt: null,
          },
          orderBy: {
            year: "asc", // primero los más viejos
          },
        });

        // Calcular total disponible
        const totalAvailable = balances.reduce((acc, b) => {
          return acc + (b.totalDays - b.usedDays);
        }, 0);

        if (totalAvailable < leave.daysCount) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        // 🔥 Descontar de los balances más antiguos primero
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

      // ✅ Actualizamos la solicitud
      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveStatus.APROBADO,
          approverId: user.id,
          decidedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ ok: true });

  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (e?.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "El empleado no tiene saldo suficiente" },
        { status: 400 }
      );
    }

    if (e?.message === "ALREADY_PROCESSED") {
      return NextResponse.json(
        { error: "La solicitud ya fue procesada" },
        { status: 400 }
      );
    }

    console.error("[APPROVE_LEAVE_ERROR]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
