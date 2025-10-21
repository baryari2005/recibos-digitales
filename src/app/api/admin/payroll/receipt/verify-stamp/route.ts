// src/app/api/admin/payroll/receipt/verify-stamp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickSnippet(text: string, needle: string, radius = 60) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  if (i < 0) return null;
  const start = Math.max(0, i - radius);
  const end = Math.min(text.length, i + needle.length + radius);
  return text.slice(start, end);
}

export async function GET(req: NextRequest) {
  const me = await getServerMe(req);
  if (!me?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // id del payroll_receipt
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const receipt = await prisma.payrollReceipt.findUnique({ where: { id } });
  if (!receipt) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const bucket = process.env.SUPABASE_BUCKET || "docs";
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const dl = await supa.storage.from(bucket).download(receipt.filePath);
  if (dl.error) return NextResponse.json({ error: dl.error.message }, { status: 500 });

  const buf = Buffer.from(await dl.data.arrayBuffer());
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const parsed = await pdfParse(buf);
  const text = (parsed?.text || "").replace(/\s+/g, " ");

  // Heurísticas de búsqueda
  const needles = [
    "Firmado el",                            // fecha
    (me as any)?.user?.nombre ?? "",         // nombre
    (me as any)?.user?.apellido ?? "",       // apellido
  ].filter(Boolean);

  const hits = needles.map((n) => ({ needle: n, snippet: pickSnippet(text, n) })).filter(h => h.snippet);

  return NextResponse.json({
    ok: true,
    filePath: receipt.filePath,
    found: hits.length > 0,
    hits,
  });
}
