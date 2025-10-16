import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
// si ya tenés un guard, importalo. Si no, permití sólo admins:
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(p: string) {
  return p.replace(/^\/+/, "");
}

export async function POST(req: NextRequest) {
  // 1) Auth (admin)
  const me = await getServerMe(req);
  const roleName = me?.user?.rol?.nombre?.toLowerCase();
  const isAdmin = roleName === "admin" || roleName === "administrador";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2) Body
  const { tmpPath, finalPrefix, oldPath } = await req.json() as {
    tmpPath: string;          // ej: "avatars/tmp/abcd.png"
    finalPrefix: string;      // ej: "users/<id>"
    oldPath?: string | null;  // ej: "avatars/users/<id>.png" (opcional)
  };

  if (!tmpPath || !finalPrefix) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const bucket = process.env.SUPABASE_BUCKET || "uploads"; // ajustá si usás otro
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ service role (server only)
  );

  const tmp = clean(tmpPath); // "avatars/tmp/abcd.png"
  const ext = path.extname(tmp) || ".png";
  const dest = clean(`avatars/${finalPrefix}${ext}`); // "avatars/users/<id>.png"

  // 3) Copiar tmp -> final
  const { error: copyErr } = await supa.storage.from(bucket).copy(tmp, dest);
  if (copyErr) {
    console.error("[avatar/commit] copy error:", copyErr);
    return NextResponse.json({ error: copyErr.message }, { status: 500 });
  }

  // 4) Borrar tmp
  await supa.storage.from(bucket).remove([tmp]);

  // 5) Borrar avatar viejo si vino
  if (oldPath) {
    const op = clean(oldPath);
    if (op && op !== dest) {
      await supa.storage.from(bucket).remove([op]).catch(() => {});
    }
  }

  // 6) URL pública
  const { data } = supa.storage.from(bucket).getPublicUrl(dest);
  return NextResponse.json({ publicUrl: data.publicUrl, path: dest });
}
