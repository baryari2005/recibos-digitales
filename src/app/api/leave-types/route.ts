import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { leaveTypeSchema } from "@/features/leave-types/schemas/leave-type.schema";
import { normalizeLeaveTypeCode } from "@/features/leave-types/lib/leave-type.helpers";
import { mapLeaveTypeRouteError } from "@/features/leave-types/lib/leave-type.errors";
import { parseLeaveTypeListParams } from "@/features/leave-types/lib/leave-type.filters";
import { listLeaveTypes } from "@/features/leave-types/services/leave-type.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasPermission(
  user: Awaited<ReturnType<typeof requireAuth>>,
  modulo: string,
  accion: string
) {
  return user.permisos?.some(
    (permission) =>
      permission.modulo === modulo && permission.accion === accion
  );
}

export async function GET(req: NextRequest) {
  try {
    const loggedInUser = await requireAuth(req);
    const params = parseLeaveTypeListParams(req.url);

    const canManageLeaveTypes = hasPermission(
      loggedInUser,
      "tipo_licencia",
      "ver"
    );

    const canRequestLeaves =
      hasPermission(loggedInUser, "licencias", "cargar") ||
      hasPermission(loggedInUser, "vacaciones", "cargar");

    if (!canManageLeaveTypes && !(params.activeOnly && canRequestLeaves)) {
      requirePermission(loggedInUser, "tipo_licencia", "ver");
    }

    const { items, meta } = await listLeaveTypes(params);

    return NextResponse.json({
      data: items,
      meta,
    });
  } catch (error) {
    return mapLeaveTypeRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, "tipo_licencia", "crear");

    const parsed = leaveTypeSchema.parse(await req.json());
    const code = normalizeLeaveTypeCode(parsed.code);

    const existing = await prisma.leaveTypeCatalog.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Leave type code already exists" },
        { status: 409 }
      );
    }

    const item = await prisma.leaveTypeCatalog.create({
      data: {
        code,
        label: parsed.label.trim(),
        colorHex: parsed.colorHex?.trim() || null,
        isActive: parsed.isActive,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return mapLeaveTypeRouteError(error);
  }
}
