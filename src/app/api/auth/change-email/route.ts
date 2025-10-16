import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { UsersRepo } from "@/lib/repos/users";
import { checkPassword } from "@/lib/passwords";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const dbUser = await UsersRepo.findById(user.id);
    if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ok = await checkPassword(password, dbUser.password);
    if (!ok) return NextResponse.json({ error: "Clave incorrecta" }, { status: 400 });

    await UsersRepo.updateEmail(user.id, email);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Bad Request" }, { status: 400 });
  }
}
