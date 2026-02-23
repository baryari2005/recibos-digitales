import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";
import { CreateLeaveUseCase } from "@/features/leaves/application/create-leave.usecase";
import { ListLeavesUseCase } from "@/features/leaves/application/list-leaves.usecase";
import { getServerMe, requireAuth } from "@/lib/server-auth";

import { LeaveStatus, LeaveType } from "@prisma/client";

async function getUserId(req: NextRequest): Promise<string> {
  const me = await getServerMe(req);

  if (!me?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return me.user.id;
}

function enumMatches<T extends object>(enm: T, q: string) {
  return Object.values(enm).filter(v =>
    v.toString().includes(q)
  );
}

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type");

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);

  const q = (searchParams.get("q") ?? "").toUpperCase();

  const statusMatches = q
    ? enumMatches(LeaveStatus, q)
    : [];

  const typeMatches = q
    ? enumMatches(LeaveType, q)
    : [];

  console.log('typeParam', typeParam);
  const where: any = {
    userId: user.id,
  };

  if (typeParam === "VACACIONES") {
    where.type = LeaveType.VACACIONES;
  }

  if (typeParam === "OTHER") {
    where.type = {
      not: LeaveType.VACACIONES,
    };
  }

  if (q) {
    where.OR = [
      ...(statusMatches.length
        ? [{ status: { in: statusMatches } }]
        : []),
      ...(typeMatches.length
        ? [{ type: { in: typeMatches } }]
        : []),
    ];
  }

  const [items, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  return NextResponse.json({
    data: items,
    meta: {
      total,
      page,
      pageCount: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const body = await req.json();

    const repo = new LeaveRepository(prisma);
    const uc = new CreateLeaveUseCase(repo);

    const data = await uc.execute(userId, body);
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (e.message === "INSUFFICIENT_VACATION_BALANCE") {
      return NextResponse.json(
        { error: "No tenés días suficientes de vacaciones" },
        { status: 400 }
      );
    }

    if (e.message === "PENDING_VACATION_EXISTS") {
      return NextResponse.json(
        {
          error: "Tenés una solicitud de vacaciones pendiente de aprobación. No podés cargar otra.",
          code: "PENDING_VACATION_EXISTS",
          pending: e.pending,
        },
        { status: 409 }
      );
    }

    if (e.message === "VACATION_DATE_OVERLAP") {
      return NextResponse.json(
        {
          error: "Las fechas se superponen con una solicitud de vacaciones existente.",
          code: "VACATION_DATE_OVERLAP",
          overlap: e.overlap,
        },
        { status: 409 }
      );
    }

    console.error(e);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}