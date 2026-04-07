import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { leaveTypeUpdateSchema } from "@/features/leave-types/schemas/leave-type.schema";
import { normalizeLeaveTypeCode } from "@/features/leave-types/lib/leave-type.helpers";
import { mapLeaveTypeRouteError } from "@/features/leave-types/lib/leave-type.errors";
import { parseLeaveTypeId } from "@/features/leave-types/lib/leave-type.params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, "tipo_licencia", "ver");

    const { id } = await params;
    const leaveTypeId = parseLeaveTypeId(id);

    if (!leaveTypeId) {
      return NextResponse.json(
        { error: "Invalid leave type id" },
        { status: 400 }
      );
    }

    const item = await prisma.leaveTypeCatalog.findUnique({
      where: { id: leaveTypeId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Leave type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    return mapLeaveTypeRouteError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, "tipo_licencia", "editar");

    const { id } = await params;
    const leaveTypeId = parseLeaveTypeId(id);

    if (!leaveTypeId) {
      return NextResponse.json(
        { error: "Invalid leave type id" },
        { status: 400 }
      );
    }

    const existing = await prisma.leaveTypeCatalog.findUnique({
      where: { id: leaveTypeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Leave type not found" },
        { status: 404 }
      );
    }

    const parsed = leaveTypeUpdateSchema.parse(await req.json());

    const data: {
      code?: string;
      label?: string;
      colorHex?: string | null;
      isActive?: boolean;
    } = {};

    if (parsed.code !== undefined) {
      data.code = normalizeLeaveTypeCode(parsed.code);
    }

    if (parsed.label !== undefined) {
      data.label = parsed.label.trim();
    }

    if (parsed.colorHex !== undefined) {
      data.colorHex = parsed.colorHex?.trim() || null;
    }

    if (parsed.isActive !== undefined) {
      data.isActive = parsed.isActive;
    }

    if (data.code) {
      const duplicate = await prisma.leaveTypeCatalog.findFirst({
        where: {
          code: data.code,
          id: { not: leaveTypeId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Leave type code already exists" },
          { status: 409 }
        );
      }
    }

    const item = await prisma.leaveTypeCatalog.update({
      where: { id: leaveTypeId },
      data,
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    return mapLeaveTypeRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, "tipo_licencia", "editar");

    const { id } = await params;
    const leaveTypeId = parseLeaveTypeId(id);

    if (!leaveTypeId) {
      return NextResponse.json(
        { error: "Invalid leave type id" },
        { status: 400 }
      );
    }

    const existing = await prisma.leaveTypeCatalog.findUnique({
      where: { id: leaveTypeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Leave type not found" },
        { status: 404 }
      );
    }

    const item = await prisma.leaveTypeCatalog.update({
      where: { id: leaveTypeId },
      data: { isActive: false },
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    return mapLeaveTypeRouteError(error);
  }
}
