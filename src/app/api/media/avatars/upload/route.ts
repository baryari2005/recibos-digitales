// src/app/api/media/avatars/upload/route.ts
export const runtime = "nodejs";

import { supabaseAdmin } from "@/lib/api/_supabase/server";
import { NextResponse } from "next/server";

import crypto from "node:crypto";

const MAX_BYTES = 200 * 1024; // 200 KB

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file requerido" }, { status: 400 });

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return NextResponse.json({ error: "Solo JPG o PNG" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo excede 200KB" }, { status: 413 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const tmpPath = `tmp/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin
    .storage.from("avatars")
    .upload(tmpPath, buf, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = supabaseAdmin.storage.from("avatars").getPublicUrl(tmpPath);
  return NextResponse.json({ tmpPath, publicUrl: data.publicUrl });
}
