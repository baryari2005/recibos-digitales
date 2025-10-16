import { NextRequest, NextResponse } from "next/server";
import { UsersRepo } from "@/lib/repos/users";
import { checkPassword } from "@/lib/passwords";
import { signJwt } from "@/lib/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userId, password } = body || {};
    if ((!email && !userId) || !password) {
      return NextResponse.json({ error: "email o userId y password son requeridos" }, { status: 400 });
    }

    const user = await UsersRepo.findByEmailOrUserId(email, userId);
    if (!user) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const ok = await checkPassword(password, user.password); // tu campo es `password`
    if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const token = await signJwt({ uid: user.id, rid: user.rol?.id, rname: user.rol?.nombre });
    return NextResponse.json({ token });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Bad Request" }, { status: 400 });
  }
}
