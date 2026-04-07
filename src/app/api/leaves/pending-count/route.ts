import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { LeaveStatus, Prisma } from "@prisma/client";

const VACATION_TYPE_CODE = "VACACIONES";

const norm = (v?: string | null) => (v ?? "").trim().toUpperCase();

const ADMIN_ROLE_IDS = new Set<number>([2, 4]);
const ADMIN_ROLE_NAMES = new Set<string>(["ADMIN", "RRHH", "ADMINISTRADOR"]);

function getViewPermissionByType(typeParam: string | null, isAdmin: boolean) {
  if (typeParam === "VACACIONES") {
    return isAdmin
      ? ({ modulo: "vacaciones", accion: "ver" } as const)
      : ({ modulo: "vacaciones", accion: "cargar" } as const);
  }

  if (typeParam === "OTHER") {
    return isAdmin
      ? ({ modulo: "licencias", accion: "ver" } as const)
      : ({ modulo: "licencias", accion: "cargar" } as const);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const loggedInUser = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");

    const roleId = Number(loggedInUser?.rol?.id ?? 0);
    const roleName = norm(loggedInUser?.rol?.nombre);

    const isAdmin =
      ADMIN_ROLE_IDS.has(roleId) || ADMIN_ROLE_NAMES.has(roleName);

    const permission = getViewPermissionByType(typeParam, isAdmin);

    if (!permission) {
      return NextResponse.json(
        { error: "Missing or invalid type parameter" },
        { status: 400 }
      );
    }

    await requirePermission(
      loggedInUser,
      permission.modulo,
      permission.accion
    );

    const where: Prisma.LeaveRequestWhereInput = {
      status: LeaveStatus.PENDIENTE,
    };

    if (!isAdmin) {
      where.userId = loggedInUser.id;
    }

    if (typeParam === "VACACIONES") {
      where.typeCatalog = {
        is: {
          code: VACATION_TYPE_CODE,
        },
      };
    } else if (typeParam === "OTHER") {
      where.typeCatalog = {
        isNot: {
          code: VACATION_TYPE_CODE,
        },
      };
    }

    const count = await prisma.leaveRequest.count({ where });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/leaves/pending-count error:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
