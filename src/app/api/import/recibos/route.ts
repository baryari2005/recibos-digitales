import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParsedRow = {
  cuil: string | null;
  apellidoNombre: string | null;
  legajo: string | null;
  fechaIngreso: string | null; // yyyy-mm-dd
  obraSocial: string | null;  
};

// ---------- helpers ----------
const toYmd = (s?: string | null) => {
  if (!s) return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
};

function parseBlock(text: string): ParsedRow {
  const cuil =
    (text.match(/C\.U\.I\.L\.\s*:\s*([\d]{2}-?[\d]{8}-?[\d])/i)?.[1] ?? null)
      ?.replace(/\D/g, "") ?? null;

  const nameLine = text.match(/([A-ZÁÉÍÓÚÑ ]+)\s+(\d{1,6})\s+(\d{2}\/\d{2}\/\d{4})/);
  const apellidoNombre = nameLine?.[1]?.trim().replace(/\s+/g, " ") ?? null;
  const legajo = nameLine?.[2] ?? null;
  const fechaIngreso = toYmd(nameLine?.[3] ?? null);

  const obraSocial = text.match(/Obra Social:\s*([A-Z0-9\.\s]+?)(?:\s{2,}|$)/i)?.[1]?.trim() ?? null;

  return { cuil, apellidoNombre, legajo, fechaIngreso, obraSocial };
}

// ---------- route ----------
export async function POST(req: NextRequest) {
  // 1) Traer archivos del form
  const form = await req.formData();
  const files = form.getAll("files").filter(Boolean) as File[];
  if (!files.length) {
    return NextResponse.json({ message: "Subí al menos un PDF" }, { status: 400 });
  }

  // 2) Importar pdf-parse *correctamente* (evita resoluciones raras)
  //    y sin leer ningún archivo del disco.
  //    Si usás TypeScript, agregá una *.d.ts* (ver paso 2).
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as any;

  const out: ParsedRow[] = [];

  for (const file of files) {
    // Asegurate de usar el binario subido por el usuario
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);

    // 3) Parsear el PDF desde el buffer (nada de paths locales)
    const parsed = await pdfParse(buf);
    const raw = String(parsed.text || "");

    // 4) Heurística: cortar por “C.U.I.L.:”
    const blocks = raw
      .split(/C\.U\.I\.L\.\s*:/i)
      .map((b, i) => (i === 0 ? b : "C.U.I.L.:" + b));

    for (const b of blocks) {
      if (/C\.U\.I\.L\./i.test(b) && /APELLIDO Y NOMBRE|[A-ZÁÉÍÓÚÑ ]+\s+\d{1,6}\s+\d{2}\/\d{2}\/\d{4}/.test(b)) {
        out.push(parseBlock(b));
      }
    }
  }

  // 5) Deduplicar por (cuil|legajo|fechaIngreso)
  const uniq = new Map<string, ParsedRow>();
  for (const r of out) {
    const key = [r.cuil ?? "", r.legajo ?? "", r.fechaIngreso ?? ""].join("|");
    uniq.set(key, r);
  }

  return NextResponse.json({ rows: Array.from(uniq.values()) });
}
