import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UsersRepo } from "@/lib/repos/users";
import { forgotPasswordSchema } from "@/lib/schemas/password";
import { randomBytes, createHash } from "node:crypto";
import { sendPasswordReset } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = forgotPasswordSchema.parse(body);

    // Buscamos usuario (idempotente)
    const user = dto.email
      ? await UsersRepo.findByEmail(dto.email)
      : dto.userId
      ? await UsersRepo.findByUserId(dto.userId)
      : null;

    // Siempre respondemos 200 para no filtrar si existe o no
    if (!user) {
      return NextResponse.json({ ok: true }); // silencioso
    }

    // TTL configurable (mins). Default 60 (1 hora)
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
  } catch (e: any) {
    // Devolvemos ok igual para no filtrar existencia de email/userId
    return NextResponse.json({ ok: true });
  }
}
