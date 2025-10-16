// src/app/api/media/avatars/discard/route.ts
import { supabaseAdmin } from "@/lib/api/_supabase/server";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const { tmpPath } = await req.json() as { tmpPath?: string };
  if (!tmpPath) return NextResponse.json({ ok: true });
  await supabaseAdmin.storage.from("avatars").remove([tmpPath]);
  return NextResponse.json({ ok: true });
}
