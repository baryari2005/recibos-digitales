import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/server-auth";
import { patchUserSchema } from "@/features/users/schemas/user.patch.schema";
import { toUserDetail } from "@/features/users/lib/user.mapper";
import {
  getUserByIdOrThrow,
  updateUserById,
  softDeleteUserById,
  mapUserDetailError,
} from "@/features/users/services/user-detail.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, ctx: RouteContext) {
  const loggedInUser = await requireAuth(req);
  requirePermission(loggedInUser, "usuarios", "editar");

  try {
    const { id } = await ctx.params;
    const user = await getUserByIdOrThrow(id);

    return NextResponse.json(toUserDetail(user));
  } catch (error) {
    const { message, status } = mapUserDetailError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const loggedInUser = await requireAuth(req);
  requirePermission(loggedInUser, "usuarios", "editar");

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const dto = patchUserSchema.parse(body);

    const updated = await updateUserById(id, dto);

    return NextResponse.json(toUserDetail(updated));
  } catch (error) {
    const { message, status } = mapUserDetailError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const loggedInUser = await requireAuth(req);
  requirePermission(loggedInUser, "usuarios", "eliminar");

  try {
    const { id } = await ctx.params;
    await softDeleteUserById(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { message, status } = mapUserDetailError(error);
    return NextResponse.json({ message }, { status });
  }
}