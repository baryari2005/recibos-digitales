import { NextRequest, NextResponse } from "next/server";
import { getServerMe, requireAuth } from "@/lib/server-auth";
import { UsersRepo } from "@/lib/repos/users";
import { checkPassword, hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "La nueva clave debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const dbUser = await UsersRepo.findById(user.id);
    if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ok = await checkPassword(currentPassword, dbUser.password);
    if (!ok) return NextResponse.json({ error: "Clave actual incorrecta" }, { status: 400 });

    const hash = await hashPassword(newPassword);
    await UsersRepo.updatePassword(user.id, hash);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Bad Request" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const me = await getServerMe(req);
  if (!me?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = schema.parse(await req.json());

  const user = await prisma.usuario.findUnique({ where: { id: me.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  console.log(currentPassword, user.password);

  const ok = await compare(currentPassword, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid current password" }, { status: 400 });

  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      password: await hash(newPassword, 12),
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ ok: true });
}
