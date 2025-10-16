import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const roles = await prisma.rol.findMany({
    orderBy: { id: "asc" },
    select: { id: true, nombre: true },
  });

  return NextResponse.json(roles);
}
