import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import crypto from "node:crypto";
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Usa SIEMPRE el bucket real (sin repetirlo en el path)
const BUCKET = process.env.SUPABASE_BUCKET || "avatars";

// Helpers: path dentro del bucket, sin "avatars/" al inicio
const clean = (p: string) => p.replace(/^\/+/, "");
const toBucketPath = (p: string) => clean(p).replace(/^avatars\//, "");

export async function POST(req: NextRequest) {
  // 1) Identidad
  const me = await getServerMe(req);
  const roleName = me?.user?.rol?.nombre?.toLowerCase();
  const isAdmin = roleName === "admin" || roleName === "administrador";
  const meId =
    (me as any)?.user?.id ??
    (me as any)?.userId ??
    (me as any)?.user?.userId ??
    null;

  if (!isAdmin && !meId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Body
  const { tmpPath, finalPrefix, oldPath } = (await req.json()) as {
    tmpPath: string;
    finalPrefix?: string;
    oldPath?: string | null;
  };
  if (!tmpPath) {
    return NextResponse.json({ error: "Faltan parámetros: tmpPath" }, { status: 400 });
  }

  // 3) Normalizar paths al **interior del bucket**
  const tmp = toBucketPath(tmpPath);              // ej: "tmp/abcd.png"
  const oldNorm = oldPath ? toBucketPath(oldPath) : null;
  const ext = path.extname(tmp) || ".png";

  // 4) Prefijo destino (sin "avatars/" al inicio)
  const basePrefix = isAdmin
    ? (finalPrefix ? toBucketPath(finalPrefix) : (meId ? `users/${meId}` : "users/unknown"))
    : `users/${meId}`;

  // 5) Generar nombre único p/evitar 409 y cache vieja
  const uniqueName = crypto.randomUUID();         // ej: "e4b1d2f1-..."
  const dest = clean(`${basePrefix}/${uniqueName}${ext}`); // "users/<id>/<uuid>.jpg"

  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("[commit:A] { BUCKET, tmp, dest, oldNorm } =>", { BUCKET, tmp, dest, oldNorm });

  // 6) Mover tmp -> dest (no debería chocar nunca)
  const { error: moveErr } = await supa.storage.from(BUCKET).move(tmp, dest);
  if (moveErr) {
    console.error("[avatar/commit] move error:", moveErr);
    return NextResponse.json({ error: moveErr.message }, { status: 500 });
  }

  // 7) Borrar viejo si existe
  if (oldNorm && oldNorm !== dest) {
    await supa.storage.from(BUCKET).remove([oldNorm]).catch(() => {});
  }

  // 8) URL pública
  const { data } = supa.storage.from(BUCKET).getPublicUrl(dest);
  return NextResponse.json({ publicUrl: data.publicUrl, path: dest });
}
