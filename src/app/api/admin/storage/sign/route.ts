// src/app/api/admin/storage/sign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // (opcional) si querés, agregá tu verificación de admin como en el split
  const me = await getServerMe(req);
  if (!me?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path"); // ej: payroll/2025-08/20-23177200-7.pdf
  const bucket = searchParams.get("bucket") || process.env.SUPABASE_BUCKET || "docs";
  if (!path) return NextResponse.json({ error: "Falta path" }, { status: 400 });

  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // firmamos por 1 hora y bajamos cache
  const { data, error } = await supa.storage.from(bucket).createSignedUrl(path, 3600, {
    download: false, // ver inline
  });
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || "No se pudo firmar URL" }, { status: 500 });
  }

  // Hacemos HEAD para ver metadatos útiles
  let head: Record<string, string | null> = {};
  try {
    const resp = await fetch(data.signedUrl, { method: "HEAD", cache: "no-store" });
    head = {
      status: String(resp.status),
      "content-length": resp.headers.get("content-length"),
      "content-type": resp.headers.get("content-type"),
      "last-modified": resp.headers.get("last-modified"),
      etag: resp.headers.get("etag"),
    };
  } catch {
    // no es crítico
  }

  return NextResponse.json({ ok: true, bucket, path, signedUrl: data.signedUrl, head });
}
