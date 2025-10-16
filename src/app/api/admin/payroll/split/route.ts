// app/api/admin/payroll/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { getServerMe } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  // --- Auth: sólo admin
  const me = await getServerMe(req);
  const adminNames = (process.env.ADMIN_ROLE_NAMES || "admin,administrador")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const adminIds = (process.env.ADMIN_ROLE_IDS || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const roleName = me?.user?.rol?.nombre?.toLowerCase() ?? "";
  const roleId = me?.user?.rol?.id?.toString() ?? "";
  const isAdmin = adminNames.includes(roleName) || (adminIds.length ? adminIds.includes(roleId) : false);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- Body
  const { path, period } = await req.json().catch(() => ({} as any));
  if (!path || !period) {
    return NextResponse.json({ error: "Falta path/period" }, { status: 400 });
  }

  // --- Supabase
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const bucket = process.env.SUPABASE_BUCKET || "docs";

  // 1) Descargar PDF maestro
  const dl = await supa.storage.from(bucket).download(path);
  if (dl.error) {
    return NextResponse.json({ error: dl.error.message }, { status: 500 });
  }
  const arrayBuf = await dl.data.arrayBuffer();
  const nodeBuffer = Buffer.from(arrayBuf); // pdf-parse → Buffer

  // 2) Extraer texto por página con pdf-parse (CJS estable)
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const pages: string[] = [];

  const render_page = (pageData: any) =>
    pageData
      .getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false })
      .then((tc: any) => {
        const text = (tc.items as any[]).map((it) => it.str).join(" ");
        pages.push(text);
        return text; // pdf-parse concatena lo que retornes
      });

  await pdfParse(nodeBuffer, { pagerender: render_page, max: 0 });

  // 3) Detectar CUIL por página
  const totalPages = pages.length;
  const re = /C\.U\.I\.L\.\s*:\s*([\d-]+)/i;

  const byCUIL = new Map<string, number[]>(); // cuil -> páginas (1-based)
  const pagesWithCuil: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    const text = pages[i] || "";
    const m = text.match(re);
    if (m?.[1]) {
      const cuil = m[1];
      if (!byCUIL.has(cuil)) byCUIL.set(cuil, []);
      byCUIL.get(cuil)!.push(i + 1);
      pagesWithCuil.push(i + 1);
    }
  }

  const detectedCount = pagesWithCuil.length;
  const uniqueCuils = [...byCUIL.keys()];
  const uniqueCount = uniqueCuils.length;

  // Duplicados: CUILs que aparecen más de una vez
  const duplicateCuils = uniqueCuils.filter((c) => (byCUIL.get(c)!.length > 1));
  const duplicatesCount = duplicateCuils.length;

  // Páginas sin CUIL
  const unmatchedPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => !pagesWithCuil.includes(p));
  const unmatchedCount = unmatchedPages.length;

  // 4) Cargar el PDF con pdf-lib (copiar páginas) y subir por CUIL (una página por CUIL)
  const srcPdf = await PDFDocument.load(new Uint8Array(arrayBuf));

  let uploaded = 0;
  for (const cuil of uniqueCuils) {
    const p1 = byCUIL.get(cuil)![0]; // primera página de ese CUIL
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(srcPdf, [p1 - 1]); // pdf-lib 0-based
    out.addPage(page);

    const bytes = await out.save(); // Uint8Array
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

    const outPath = `payroll/${period}/${sanitize(cuil)}.pdf`;
    const up = await supa.storage
      .from(bucket)
      .upload(outPath, ab, { contentType: "application/pdf", upsert: true });

    if (!up.error) uploaded++;
  }

  const endedAt = Date.now();

  return NextResponse.json({
    bucket,
    period,
    sourcePath: path,
    prefixPath: `payroll/${period}/`,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationMs: endedAt - startedAt,

    // métricas
    totalPages,
    detectedPagesWithCuil: detectedCount,
    uniqueCuils: uniqueCount,
    uploaded,
    duplicates: {
      count: duplicatesCount,
      cuils: duplicateCuils.slice(0, 20), // recorte para respuesta
    },
    unmatched: {
      count: unmatchedCount,
      pages: unmatchedPages.slice(0, 50), // recorte para respuesta
    },
    sampleCuils: uniqueCuils.slice(0, 20),
  });
}
