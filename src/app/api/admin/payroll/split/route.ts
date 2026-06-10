// app/api/admin/payroll/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { getServerMe } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfTextItem = {
  str: string;
};

type PdfTextMarkedContent = {
  type: string;
  id?: string;
};

type PdfTextContent = {
  items: Array<PdfTextItem | PdfTextMarkedContent>;
};

type PdfPageData = {
  getTextContent: (options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }) => Promise<PdfTextContent>;
};

const DIGIT_CUIL_RE = /\b(\d{2})-?(\d{8})-?(\d)\b/g;
const LEGACY_LABEL_CUIL_RE = /C\.U\.I\.L\.?\s*(?:N[º°o]\.?)?\s*:\s*([\d-]+)/i;

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function toDisplayPeriod(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  return `${m}-${y}`;
}

function typeSuffix(type: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO") {
  return type === "VACACIONES"
    ? "-VAC"
    : type === "AGUINALDO"
      ? "-SAC"
      : type === "BONO"
        ? "-BON"
        : "";
}

function toStoragePeriodFolder(
  yyyyMm: string,
  type: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO"
) {
  return `${yyyyMm}${typeSuffix(type)}`;
}

function toDbPeriod(
  yyyyMm: string,
  type: "SALARIO" | "VACACIONES" | "AGUINALDO" | "BONO"
) {
  return `${toDisplayPeriod(yyyyMm)}${typeSuffix(type)}`;
}

function toPeriodDateUtc(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
}

function normalizeCuil(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return null;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

function looksLikePersonalCuil(value: string) {
  return /^(20|23|24|27)-\d{8}-\d$/.test(value);
}

function extractEmployeeCuil(text: string) {
  const legacyMatch = text.match(LEGACY_LABEL_CUIL_RE);
  const legacyCuil = legacyMatch?.[1] ? normalizeCuil(legacyMatch[1]) : null;
  if (legacyCuil && looksLikePersonalCuil(legacyCuil)) {
    return legacyCuil;
  }

  const counts = new Map<string, number>();

  for (const match of text.matchAll(DIGIT_CUIL_RE)) {
    const normalized = normalizeCuil(match[0]);
    if (!normalized || !looksLikePersonalCuil(normalized)) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return legacyCuil;
  }

  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return text.indexOf(a[0]) - text.indexOf(b[0]);
    })[0]?.[0] ?? legacyCuil;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

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
  const isAdmin =
    adminNames.includes(roleName) ||
    (adminIds.length ? adminIds.includes(roleId) : false);

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json(
      { error: "receiptType invalido" },
      { status: 400 }
    );
  }

  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const bucket = process.env.SUPABASE_BUCKET || "docs";
  const isBucketPublic =
    String(process.env.SUPABASE_BUCKET_PUBLIC ?? "true") === "true";

  const dl = await supa.storage.from(bucket).download(path);
  if (dl.error) {
    return NextResponse.json({ error: dl.error.message }, { status: 500 });
  }

  const arrayBuf = await dl.data.arrayBuffer();
  const nodeBuffer = Buffer.from(arrayBuf);

  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const pages: string[] = [];

  const renderPage = (pageData: PdfPageData) =>
    pageData
      .getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      })
      .then((tc: PdfTextContent) => {
        const text = tc.items
          .filter((item): item is PdfTextItem => "str" in item)
          .map((item) => item.str)
          .join(" ");

        pages.push(text);
        return text;
      });

  await pdfParse(nodeBuffer, { pagerender: renderPage, max: 0 });

  const totalPages = pages.length;
  const byCUIL = new Map<string, number[]>();
  const pagesWithCuil: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    const text = pages[i] || "";
    const cuil = extractEmployeeCuil(text);
    if (!cuil) continue;

    if (!byCUIL.has(cuil)) byCUIL.set(cuil, []);
    byCUIL.get(cuil)!.push(i + 1);
    pagesWithCuil.push(i + 1);
  }

  const detectedCount = pagesWithCuil.length;
  const uniqueCuils = [...byCUIL.keys()];
  const uniqueCount = uniqueCuils.length;
  const duplicateCuils = uniqueCuils.filter((c) => byCUIL.get(c)!.length > 1);
  const duplicatesCount = duplicateCuils.length;
  const unmatchedPages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter((p) => !pagesWithCuil.includes(p));
  const unmatchedCount = unmatchedPages.length;

  const srcPdf = await PDFDocument.load(new Uint8Array(arrayBuf));
  let uploaded = 0;
  const createdOrUpdatedIds: string[] = [];

  const periodDisplay = toDbPeriod(period, type);
  const periodFolder = toStoragePeriodFolder(period, type);
  const periodDate = toPeriodDateUtc(period);

  for (const cuil of uniqueCuils) {
    const p1 = byCUIL.get(cuil)![0];
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(srcPdf, [p1 - 1]);
    out.addPage(page);

    const bytes = await out.save();
    const ab = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;

    const cuilForDb = cuil.replace(/[^\d-]/g, "");
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

    let fileUrl = "";
    if (isBucketPublic) {
      const { data } = supa.storage.from(bucket).getPublicUrl(outPath);
      fileUrl = data.publicUrl;
    }

    try {
      const rec = await prisma.payrollReceipt.upsert({
        where: { cuil_period: { cuil: cuilForDb, period: periodDisplay } },
        update: {
          filePath: outPath,
          fileUrl,
        },
        create: {
          cuil: cuilForDb,
          period: periodDisplay,
          periodDate,
          filePath: outPath,
          fileUrl,
        },
      });

      createdOrUpdatedIds.push(rec.id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          "[split] DB upsert error:",
          cuilForDb,
          periodDisplay,
          error.message
        );
      }
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
    totalPages,
    detectedPagesWithCuil: detectedCount,
    uniqueCuils: uniqueCount,
    uploaded,
    createdOrUpdatedIds,
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
