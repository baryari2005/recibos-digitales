import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { getRoleById, setRolePermissions } from "@/lib/services/role.service";
import { setPermissionsSchema } from "@/features/roles/schemas/role.schema";
import { parseRoleId } from "@/features/roles/lib/role.params";
import { mapRoleRouteError } from "@/features/roles/lib/role.errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, "roles", "editar");

    const { id } = await params;
    const roleId = parseRoleId(id);

    if (!roleId) {
      return NextResponse.json(
        { error: "Invalid role id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const dto = setPermissionsSchema.parse(body);

    const existing = await getRoleById(roleId);

    if (!existing) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    await setRolePermissions(roleId, dto.permisoIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    return mapRoleRouteError(error);
  }
}