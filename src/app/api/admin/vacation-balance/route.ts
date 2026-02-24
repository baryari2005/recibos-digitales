import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { VacationBalanceRepository } from "@/features/leaves/infrastructure/vacation-balance.prisma-repository";
import { ListVacationBalancesUseCase } from "@/features/leaves/application/list-vacation-balance.usecase";
import { CreateVacationBalanceUseCase } from "@/features/leaves/application/create-vacation-balance.usecase";
import { UpdateVacationBalanceUseCase } from "@/features/leaves/application/update-vacation-balance.usecase";
import { RestoreVacationBalanceUseCase } from "@/features/leaves/application/restore-vacation-balance.usecase";
import { requireAdmin } from "@/lib/authz";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.res;

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const repo = new VacationBalanceRepository(prisma);
    const uc = new ListVacationBalancesUseCase(repo);

    const { items, total } = await uc.execute({
      q,
      page,
      pageSize,
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
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET_VACATION_BALANCES]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.res;

    const body = await req.json();
    const { userId, year, totalDays } = body;

    if (!userId || !year || totalDays == null) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const repo = new VacationBalanceRepository(prisma);
    const createUC = new CreateVacationBalanceUseCase(repo);
    const updateUC = new UpdateVacationBalanceUseCase(repo);
    const restoreUC = new RestoreVacationBalanceUseCase(repo);

    try {
      const balance = await createUC.execute({
        userId,
        year,
        totalDays,
      });

      return NextResponse.json(balance, { status: 201 });
    } catch (e: any) {
      if (e?.message !== "BALANCE_ALREADY_EXISTS") {
        throw e;
      }

      // 👉 buscar balance borrado lógicamente
      const deletedBalance = await repo.findDeletedByUserAndYear(
        userId,
        year
      );

      if (!deletedBalance) {
        return NextResponse.json(
          { error: "Balance already exists" },
          { status: 400 }
        );
      }

      // 👉 reactivar
      const restored = await restoreUC.execute(deletedBalance.id,
        totalDays
      );

      return NextResponse.json(restored, { status: 200 });
    }
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[CREATE_VACATION_BALANCE]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// export async function PATCH(
//     req: NextRequest,
//     { params }: { params: { id: string } }
// ) {
//     try {
//         const user = await requireAuth(req);

//         if (!["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user.rol.nombre)) {
//             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//         }

//         const body = await req.json();

//         const repo = new VacationBalanceRepository(prisma);
//         const uc = new UpdateVacationBalanceUseCase(repo);

//         const updated = await uc.execute(params.id, body);

//         return NextResponse.json(updated);
//     } catch (e: any) {
//         if (e?.message === "UNAUTHORIZED") {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }
//         console.error("[UPDATE_VACATION_BALANCE]", e);
//         return NextResponse.json({ error: "Server error" }, { status: 500 });
//     }
// }