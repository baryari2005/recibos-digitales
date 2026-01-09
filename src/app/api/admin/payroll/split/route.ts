// app/api/admin/payroll/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { getServerMe } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helpers
function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// "2025-08" -> "08-2025"
function toDisplayPeriod(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  return `${m}-${y}`;
}

function typeSuffix(type: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO") {
  return type === "VACACIONES" ? "-VAC" : type === "AGUINALDO" ? "-SAC" : type === "BONO" ? "-BON" : "";
}

// folder de storage: "2025-08" o "2025-08-VAC"
function toStoragePeriodFolder(yyyyMm: string, type: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO") {
  return `${yyyyMm}${typeSuffix(type)}`;
}

// period en DB: "08-2025" o "08-2025-VAC"
function toDbPeriod(yyyyMm: string, type: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO") {
  return `${toDisplayPeriod(yyyyMm)}${typeSuffix(type)}`;
}

// 1° día del mes en UTC
function toPeriodDateUtc(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  // --- Auth: sólo admin
  const me = await getServerMe(req);
  const adminNames = (process.env.ADMIN_ROLE_NAMES || "admin,administrador")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const adminIds = (process.env.ADMIN_ROLE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const roleName = me?.user?.rol?.nombre?.toLowerCase() ?? "";
  const roleId = me?.user?.rol?.id?.toString() ?? "";
  const isAdmin = adminNames.includes(roleName) || (adminIds.length ? adminIds.includes(roleId) : false);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- Body
  const { path, period, receiptType } = (await req.json().catch(() => ({}))) as {
    path?: string;
    period?: string;
    receiptType?: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO";
  };

  if (!path || !period) {
    return NextResponse.json({ error: "Falta path/period" }, { status: 400 });
  }

  const type = receiptType ?? "SALARIO";
  if (!["SALARIO", "VACACIONES", "AGUINALDO", "BONO"].includes(type)) {
    return NextResponse.json({ error: "receiptType inválido" }, { status: 400 });
  }

  // --- Supabase
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const bucket = process.env.SUPABASE_BUCKET || "docs";
  const isBucketPublic = String(process.env.SUPABASE_BUCKET_PUBLIC ?? "true") === "true";

  // 1) Descargar PDF maestro
  const dl = await supa.storage.from(bucket).download(path);
  if (dl.error) {
    return NextResponse.json({ error: dl.error.message }, { status: 500 });
  }
  const arrayBuf = await dl.data.arrayBuffer();
  const nodeBuffer = Buffer.from(arrayBuf);

  // 2) Extraer texto por página
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const pages: string[] = [];

  const render_page = (pageData: any) =>
    pageData
      .getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false })
      .then((tc: any) => {
        const text = (tc.items as any[]).map((it) => it.str).join(" ");
        pages.push(text);
        return text;
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
      const cuil = m[1]; // ej. "20-23177200-7"
      if (!byCUIL.has(cuil)) byCUIL.set(cuil, []);
      byCUIL.get(cuil)!.push(i + 1);
      pagesWithCuil.push(i + 1);
    }
  }

  const detectedCount = pagesWithCuil.length;
  const uniqueCuils = [...byCUIL.keys()];
  const uniqueCount = uniqueCuils.length;

  // Duplicados: CUILs que aparecen más de una vez
  const duplicateCuils = uniqueCuils.filter((c) => byCUIL.get(c)!.length > 1);
  const duplicatesCount = duplicateCuils.length;

  // Páginas sin CUIL
  const unmatchedPages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => !pagesWithCuil.includes(p));
  const unmatchedCount = unmatchedPages.length;

  // 4) Cargar el PDF con pdf-lib (copiar páginas) y subir por CUIL (1 página por CUIL)
  const srcPdf = await PDFDocument.load(new Uint8Array(arrayBuf));

  let uploaded = 0;
  const createdOrUpdatedIds: string[] = [];

  //const periodDisplay = toDisplayPeriod(period);     // "MM-YYYY"
  const periodDisplay = toDbPeriod(period, type);                // "MM-YYYY" o "MM-YYYY-VAC"
  const periodFolder = toStoragePeriodFolder(period, type);      // "YYYY-MM" o "YYYY-MM-VAC"
  const periodDate = toPeriodDateUtc(period);        // Date

  for (const cuil of uniqueCuils) {
    const p1 = byCUIL.get(cuil)![0]; // primera página de ese CUIL
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(srcPdf, [p1 - 1]); // pdf-lib 0-based
    out.addPage(page);

    const bytes = await out.save(); // Uint8Array
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

    // Archivo destino en Storage
    // Nota: para nombre de archivo usamos sanitize, para DB guardamos el CUIL "con guiones".
    const cuilForDb = cuil.replace(/[^\d-]/g, ""); // asegura formato "##-########-#"
    const outPath = `payroll/${periodFolder}/${sanitize(cuilForDb)}.pdf`;

    const up = await supa.storage.from(bucket).upload(outPath, ab, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (up.error) {
      console.error("[split] upload error:", outPath, up.error.message);
      continue;
    }
    uploaded++;

    // URL pública (si el bucket es público)
    let fileUrl = "";
    if (isBucketPublic) {
      const { data } = supa.storage.from(bucket).getPublicUrl(outPath);
      fileUrl = data.publicUrl; // estable
    }

    // 5) Registrar en DB (upsert por cuil + period)
    try {
      const rec = await prisma.payrollReceipt.upsert({
        where: { cuil_period: { cuil: cuilForDb, period: periodDisplay } },
        update: {
          filePath: outPath,
          fileUrl: fileUrl, // puede ser "" si bucket privado
        },
        create: {
          cuil: cuilForDb,
          period: periodDisplay,
          periodDate: periodDate,
          filePath: outPath,
          fileUrl: fileUrl,
        },
      });
      createdOrUpdatedIds.push(rec.id);
    } catch (e: any) {
      // No frenamos todo el proceso por un error de DB.
      console.error("[split] DB upsert error:", cuilForDb, periodDisplay, e?.message);
    }
  }

  const endedAt = Date.now();

  return NextResponse.json({
    bucket,
    period,
    sourcePath: path,
    prefixPath: `payroll/${periodFolder}/`,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationMs: endedAt - startedAt,

    // métricas
    totalPages,
    detectedPagesWithCuil: detectedCount,
    uniqueCuils: uniqueCount,
    uploaded,
    createdOrUpdatedIds, // ids de registros en DB (si te sirve debug)
    duplicates: {
      count: duplicatesCount,
      cuils: duplicateCuils.slice(0, 20),
    },
    unmatched: {
      count: unmatchedCount,
      pages: unmatchedPages.slice(0, 50),
    },
    sampleCuils: uniqueCuils.slice(0, 20),
  });
}
