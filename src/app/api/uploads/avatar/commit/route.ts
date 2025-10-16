import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = process.env.SUPABASE_BUCKET || "avatars";

const clean = (p: string) => p.replace(/^\/+/, "");
const ensureAvatarsPrefix = (p: string) => (p.startsWith("avatars/") ? p : `avatars/${p}`);
const stripBucketPrefix = (p: string) => clean(p).replace(/^avatars\//, "");

export async function POST(req: NextRequest) {
  const me = await getServerMe(req);  
  const roleName = me?.user?.rol?.nombre?.toLowerCase();
  const isAdmin = roleName === "admin" || roleName === "administrador";
  const meId =
    (me as any)?.user?.id ||
    (me as any)?.userId ||
    (me as any)?.user?.userId ||
    null;

  if (!isAdmin && !meId) {
    // si no hay identidad => 401
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Body
  const { tmpPath, finalPrefix, oldPath } = (await req.json()) as {
    tmpPath: string;
    finalPrefix?: string;     // admins pueden pasarlo
    oldPath?: string | null;
  };

  if (!tmpPath) {
    return NextResponse.json({ error: "Faltan parámetros: tmpPath" }, { status: 400 });
  }

  // 3) Normalizar paths
  const tmp = clean(stripBucketPrefix(tmpPath)); // ej: avatars/tmp/abcd.png
  const ext = path.extname(tmp) || ".png";

  // 4) Prefijo destino
  //    - Admin: usa finalPrefix si lo mandan, sino su propio id
  //    - Usuario: siempre users/<meId>
  const basePrefix = isAdmin
    ? (finalPrefix ? clean(finalPrefix.replace(/^avatars\//, "")) : (meId ? `users/${meId}` : "users/unknown"))
    : `users/${meId}`;

  const dest = clean(`avatars/${basePrefix}${ext}`); // ej: avatars/users/<id>.png

  // 5) Validar oldPath (si no es admin, debe ser suyo)
  const oldNorm = oldPath ? clean(ensureAvatarsPrefix(oldPath)) : null;
  if (!isAdmin && oldNorm && !oldNorm.startsWith(`avatars/users/${meId}`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 6) Supabase client (service role)
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

   console.log("[commit] BUCKET/tmp/dest/old:", { BUCKET, tmp, dest, oldNorm });
   
  // 7) Copiar tmp -> final
  const { error: copyErr } = await supa.storage.from(BUCKET).copy(tmp, dest);
  if (copyErr) {
    console.error("[avatar/commit] copy error:", copyErr);
    return NextResponse.json({ error: copyErr.message }, { status: 500 });
  }

  // 8) Limpiar temporales
  await supa.storage.from(BUCKET).remove([tmp]).catch(() => {});
  if (oldNorm && oldNorm !== dest) {
    await supa.storage.from(BUCKET).remove([oldNorm]).catch(() => {});
  }

  // 9) URL pública
  const { data } = supa.storage.from(BUCKET).getPublicUrl(dest);
  return NextResponse.json({ publicUrl: data.publicUrl, path: dest });
}
