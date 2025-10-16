import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const rec = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!rec) return NextResponse.json({ valid: false }, { status: 400 });
  return NextResponse.json({ valid: true });
}
