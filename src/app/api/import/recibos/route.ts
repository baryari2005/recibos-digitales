import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParsedRow = {
  cuil: string | null;
  apellidoNombre: string | null;
  legajo: string | null;
  fechaIngreso: string | null;
  obraSocial: string | null;
};

type PdfParseResult = {
  text?: string;
};

type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

const toYmd = (s?: string | null) => {
  if (!s) return null;

  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

function parseBlock(text: string): ParsedRow {
  const cuil =
    (text.match(/C\.U\.I\.L\.\s*:\s*([\d]{2}-?[\d]{8}-?[\d])/i)?.[1] ?? null)
      ?.replace(/\D/g, "") ?? null;

  const nameLine = text.match(
    /([A-ZÁÉÍÓÚÑ ]+)\s+(\d{1,6})\s+(\d{2}\/\d{2}\/\d{4})/
  );

  const apellidoNombre = nameLine?.[1]?.trim().replace(/\s+/g, " ") ?? null;
  const legajo = nameLine?.[2] ?? null;
  const fechaIngreso = toYmd(nameLine?.[3] ?? null);

  const obraSocial =
    text.match(/Obra Social:\s*([A-Z0-9\.\s]+?)(?:\s{2,}|$)/i)?.[1]?.trim() ??
    null;

  return { cuil, apellidoNombre, legajo, fechaIngreso, obraSocial };
}

function isFile(value: FormDataEntryValue): value is File {
  return value instanceof File;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files").filter(isFile);

  if (!files.length) {
    return NextResponse.json(
      { message: "Subí al menos un PDF" },
      { status: 400 }
    );
  }

  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = pdfParseModule.default as PdfParseFn;

  const out: ParsedRow[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await pdfParse(buffer);
    const raw = String(parsed.text ?? "");

    const blocks = raw
      .split(/C\.U\.I\.L\.\s*:/i)
      .map((block, index) => (index === 0 ? block : `C.U.I.L.:${block}`));

    for (const block of blocks) {
      if (
        /C\.U\.I\.L\./i.test(block) &&
        /APELLIDO Y NOMBRE|[A-ZÁÉÍÓÚÑ ]+\s+\d{1,6}\s+\d{2}\/\d{2}\/\d{4}/.test(
          block
        )
      ) {
        out.push(parseBlock(block));
      }
    }
  }

  const uniq = new Map<string, ParsedRow>();

  for (const row of out) {
    const key = [
      row.cuil ?? "",
      row.legajo ?? "",
      row.fechaIngreso ?? "",
    ].join("|");

    uniq.set(key, row);
  }

  return NextResponse.json({ rows: Array.from(uniq.values()) });
}