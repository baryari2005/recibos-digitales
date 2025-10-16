// src/app/api/uploads/avatar/commit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(p: string) {
  return p.replace(/^\/+/, "");
}

export async function POST(req: NextRequest) {
  // 1) Auth
  const me = await getServerMe(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleName = me.user?.rol?.nombre?.toLowerCase();
  const isAdmin = roleName === "admin" || roleName === "administrador";

  // 2) Body
  const { tmpPath, finalPrefix, oldPath } = (await req.json()) as {
    tmpPath: string;          // ej: "avatars/tmp/abcd.png"
    finalPrefix: string;      // ej: "users/<id>"
    oldPath?: string | null;  // ej: "avatars/users/<id>.png"
  };

  if (!tmpPath || !finalPrefix) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // 3) Dueño = id dentro de finalPrefix
  const match = /users\/([^/]+)/.exec(finalPrefix);
  const targetUserId = match?.[1];
  const isOwner = !!targetUserId && me.user?.id === targetUserId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) Supabase client (service role SOLO en server)
  const bucket = process.env.SUPABASE_BUCKET || "uploads";
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const tmp = clean(tmpPath); // "avatars/tmp/abcd.png"
  const ext = path.extname(tmp) || ".png";
  const dest = clean(`avatars/${finalPrefix}${ext}`); // "avatars/users/<id>.png"

  // 5) Copiar tmp -> final
  const { error: copyErr } = await supa.storage.from(bucket).copy(tmp, dest);
  if (copyErr) {
    console.error("[avatar/commit] copy error:", copyErr);
    return NextResponse.json({ error: copyErr.message }, { status: 500 });
  }

  // 6) Borrar tmp y viejo
  await supa.storage.from(bucket).remove([tmp]).catch(() => {});
  if (oldPath) {
    const op = clean(oldPath);
    if (op && op !== dest) await supa.storage.from(bucket).remove([op]).catch(() => {});
  }

  // 7) URL pública
  const { data } = supa.storage.from(bucket).getPublicUrl(dest);
  return NextResponse.json({ publicUrl: data.publicUrl, path: dest });
}
