// Reexpone la misma lógica que /auth/password/forgot
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UsersRepo } from "@/lib/repos/users";
import { randomBytes, createHash } from "node:crypto";
import { sendPasswordReset } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    const user = email
      ? await UsersRepo.findByEmail(email)
      : userId
      ? await UsersRepo.findByUserId(userId)
      : null;

    // Responder 200 siempre (no filtrar existencia)
    if (!user) return NextResponse.json({ ok: true });

    const ttlMin = parseInt(process.env.PASSWORD_RESET_TTL_MIN || "60", 10);
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    const tokenPlain = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(tokenPlain).digest("hex");

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${tokenPlain}`;

    await sendPasswordReset(user.email, resetLink, user.nombre ?? undefined);

    return NextResponse.json({ ok: true });
  } catch {
    // no filtramos info
    return NextResponse.json({ ok: true });
  }
}
