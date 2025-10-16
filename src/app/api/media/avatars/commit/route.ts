// src/app/api/media/avatars/commit/route.ts
import { supabaseAdmin } from "@/lib/api/_supabase/server";
import { NextResponse } from "next/server";

import crypto from "node:crypto";
import path from "node:path";

export async function POST(req: Request) {
  const { tmpPath, finalPrefix, deleteOldPath } = await req.json() as {
    tmpPath: string;              // p.ej. "tmp/3b0c...-a.png"
    finalPrefix: string;          // p.ej. `users/${userId}`
    deleteOldPath?: string | null // p.ej. "users/123/old.png"
  };

  if (!tmpPath || !finalPrefix) {
    return NextResponse.json({ error: "tmpPath y finalPrefix requeridos" }, { status: 400 });
  }

  const ext = path.extname(tmpPath) || ".png";
  const filename = `${crypto.randomUUID()}${ext}`;
  const finalPath = `${finalPrefix}/${filename}`;

  // mover dentro del mismo bucket
  const { error: moveError } = await supabaseAdmin
    .storage.from("avatars")
    .move(tmpPath, finalPath);

  if (moveError) {
    return NextResponse.json({ error: moveError.message }, { status: 400 });
  }

  if (deleteOldPath) {
    await supabaseAdmin.storage.from("avatars").remove([deleteOldPath]);
  }

  const { data } = supabaseAdmin.storage.from("avatars").getPublicUrl(finalPath);
  return NextResponse.json({ path: finalPath, publicUrl: data.publicUrl });
}
