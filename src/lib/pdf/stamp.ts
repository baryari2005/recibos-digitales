import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import path from "node:path";
import { readFile } from "node:fs/promises";

export type XY = { x: number; y: number };

export type Segment = {
  lines: string[];
  positions?: XY[];
  font?: "default" | "script";
  fontPath?: string; // leer desde FS (cuando está disponible)
  fontUrl?: string;  // leer desde URL (CDN/Google Fonts/raw)
  fontSupabase?: { bucket: string; path: string }; // leer desde Supabase Storage
  fontSize?: number;
  lineHeight?: number;
  centerX?: boolean;
  maxWidth?: number;
  color?: { r: number; g: number; b: number };
  yBase?: number;
};

export async function stampReceipt(opts: {
  bucket: string;
  pathInBucket: string;
  segments: Segment[];
  debug?: boolean;
}) {
  // Cliente Supabase (server)
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Descargar PDF
  const dl = await supa.storage.from(opts.bucket).download(opts.pathInBucket);
  if (dl.error) throw new Error(`No se pudo descargar PDF: ${dl.error.message}`);
  const pdfBytes = await dl.data.arrayBuffer();

  const pdf = await PDFDocument.load(pdfBytes);
  const helvetica = await pdf.embedStandardFont(StandardFonts.Helvetica);

  // fontkit opcional
  let fontkit: any = null;
  try {
    const mk = await import("@pdf-lib/fontkit");
    fontkit = mk.default;
    if (fontkit) pdf.registerFontkit(fontkit);
  } catch {
    // sin fontkit: solo Helvetica
  }

  // Helpers
  const normalizeColor = (c?: { r: number; g: number; b: number }) => {
    const def = { r: 0, g: 0, b: 0 };
    const src = c ?? def;
    const scale = src.r > 1 || src.g > 1 || src.b > 1 ? 255 : 1;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    return rgb(clamp01(src.r / scale), clamp01(src.g / scale), clamp01(src.b / scale));
  };

  const safeWidth = (text: string, size: number, font: any) => {
    try {
      const w = font.widthOfTextAtSize(text, size);
      return Number.isFinite(w) ? w : 0;
    } catch { return 0; }
  };

  const loadScriptFont = async (seg: Segment) => {
    if (!fontkit) return helvetica;

    // 1) Supabase Storage
    if (seg.fontSupabase?.bucket && seg.fontSupabase?.path) {
      try {
        const fdl = await supa.storage.from(seg.fontSupabase.bucket).download(seg.fontSupabase.path);
        if (!fdl.error) {
          const bytes = new Uint8Array(await fdl.data.arrayBuffer());
          return await pdf.embedFont(bytes, { subset: true });
        }
      } catch { /* fallback abajo */ }
    }

    // 2) URL
    if (seg.fontUrl) {
      try {
        const res = await fetch(seg.fontUrl);
        if (res.ok) {
          const bytes = new Uint8Array(await res.arrayBuffer());
          return await pdf.embedFont(bytes, { subset: true });
        }
      } catch { /* fallback abajo */ }
    }

    // 3) Ruta local (cuando hay FS disponible)
    const fp =
      seg.fontPath || path.join(process.cwd(), "public", "fonts", "GreatVibes-Regular.ttf");
    try {
      const bytes = await readFile(fp);
      return await pdf.embedFont(bytes, { subset: true });
    } catch {
      return helvetica; // fallback definitivo
    }
  };

  // Página 1
  const page = pdf.getPage(0);
  const { width, height } = page.getSize();

  // Render
  for (const seg0 of opts.segments) {
    const seg = {
      lines: (seg0.lines ?? []).map(s => `${s ?? ""}`.trim()).filter(Boolean),
      font: seg0.font ?? "default",
      fontPath: seg0.fontPath,
      fontUrl: seg0.fontUrl,
      fontSupabase: seg0.fontSupabase,
      fontSize: seg0.fontSize ?? (seg0.font === "script" ? 16 : 9),
      lineHeight: seg0.lineHeight ?? (seg0.font === "script" ? 16 : 10),
      centerX: seg0.centerX ?? true,
      maxWidth: seg0.maxWidth ?? 0,
      positions: seg0.positions as XY[] | undefined,
      color: seg0.color,
      yBase: seg0.yBase,
    };

    if (!seg.lines.length) continue;

    const fontObj = seg.font === "script" ? await loadScriptFont(seg) : helvetica;

    // posiciones por defecto
    let targets: XY[] = seg.positions?.length
      ? seg.positions
      : [{ x: width * 0.365, y: Math.max(60, seg.yBase ?? 60) }];

    targets = targets.map(t => ({
      x: Math.max(10, Math.min(width - 10, t.x)),
      y: Math.max(10, Math.min(height - 10, t.y)),
    }));

    // Auto-fit de UNA línea
    let size = seg.fontSize;
    let lh   = seg.lineHeight;
    if (seg.maxWidth && seg.lines.length === 1) {
      let trySize = size;
      let w = safeWidth(seg.lines[0], trySize, fontObj);
      let guard = 0;
      while (w > seg.maxWidth && trySize > 8 && guard++ < 120) {
        trySize -= 0.5;
        w = safeWidth(seg.lines[0], trySize, fontObj);
      }
      size = trySize;
      if (seg0.lineHeight === undefined) lh = Math.max(10, Math.round(size));
    }

    const color = normalizeColor(seg.color);
    const leftMargin = 10;
    const rightMargin = 10;

    for (const t of targets) {
      let y = t.y;
      for (const line of seg.lines) {
        const tw = safeWidth(line, size, fontObj);
        let x = seg.centerX && tw > 0 ? t.x - tw / 2 : t.x;

        const maxX = width - rightMargin - Math.max(0, tw);
        if (!Number.isFinite(x)) x = t.x;
        x = Math.max(leftMargin, Math.min(maxX, x));

        page.drawText(line, { x, y, size, font: fontObj, color });
        y -= lh;
      }

      if (opts.debug) {
        // Cruz de referencia
        page.drawRectangle({ x: t.x - 6, y: t.y - 0.3, width: 12, height: 0.6, color: rgb(1, 0, 0) });
        page.drawRectangle({ x: t.x - 0.3, y: t.y - 6, width: 0.6, height: 12, color: rgb(1, 0, 0) });
      }
    }
  }

  // Guardar
  const stamped = await pdf.save();
  const ab: ArrayBuffer = stamped.slice().buffer;

  const up = await supa.storage.from(opts.bucket).upload(opts.pathInBucket, ab, {
    contentType: "application/pdf",
    cacheControl: "1",
    upsert: true,
  });
  if (up.error) throw new Error(`No se pudo subir PDF estampado: ${up.error.message}`);
}
