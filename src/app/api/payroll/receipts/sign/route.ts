// src/app/api/payroll/receipts/sign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";
import { stampReceipt } from "@/lib/pdf/stamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Helpers para armar el nombre de firma robusto
function toTitle(s: string) { return (s ?? "").toLowerCase().replace(/\b(\p{L})/gu, (m) => m.toUpperCase()); }
function toSignatureName(full: string) {
  const parts = (full ?? "").trim().split(/\s+/);
  if (parts.length >= 2) return `${toTitle(parts[0])} ${toTitle(parts[parts.length - 1])}`;
  return toTitle(full ?? "Empleado");
}
function pickSignatureName(me: any, legajo: any) {
  const fromLegajo = [legajo?.usuario?.nombre, legajo?.usuario?.apellido].filter(Boolean).join(" ").trim();
  const fromMeNA = [me?.user?.nombre, me?.user?.apellido].filter(Boolean).join(" ").trim();
  const fromName = (me?.user?.name ?? "").trim();
  const fromEmail = (me?.user?.email ?? "").split("@")[0]?.replace(/[._-]+/g, " ").trim();
  const raw = fromLegajo || fromMeNA || fromName || fromEmail || "Empleado";
  return toSignatureName(raw);
}

export async function PATCH(req: NextRequest) {
  try {
    const me = await getServerMe(req);
    const userId = me?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, disagree, observations } = (await req.json()) as { id?: string; disagree?: boolean; observations?: string; };
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    // Traer CUIL y nombre
    const legajo = await prisma.legajo.findUnique({
      where: { usuarioId: userId },
      select: { usuario: { select: { nombre: true, apellido: true } } },
    });

    const rawCuil = (me as any)?.user?.cuil || (me as any)?.user?.cuilNumero;
    if (!rawCuil) return NextResponse.json({ error: "CUIL no configurado" }, { status: 400 });
    const cuil = cuilDashed(rawCuil);

    // Verificamos recibo
    const existing = await prisma.payrollReceipt.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (existing.cuil !== cuil) return NextResponse.json({ error: "No permitido" }, { status: 403 });

    // Actualizar flags en DB
    const updated = await prisma.payrollReceipt.update({
      where: { id },
      data: {
        signed: true,
        signedDisagreement: Boolean(disagree),
        observations: typeof observations === "string" ? observations : existing.observations,
      },
    });

    // === PROBADOR DE ESTAMPADO ===
    const signatureRaw = pickSignatureName(me, legajo);
    const signatureName = signatureRaw?.trim() || "Empleado";

    // Coordenadas
    const centerX = 330;   // centro aprox. de la columna izquierda
    const baseY = 42;    // un poco más alto (pdf-lib mide desde ABAJO)
    const maxW = 240;   // ancho máx. para auto-fit

    // Texto de fecha
    const now = new Date();
    const fechaLinea = `Firmado el ${fmtDate(now)}${disagree ? " (NO CONFORME)" : ""}`;

    // Para probar: primero Helvetica (descarta problemas de TTF)
    const USE_DEFAULT_FONT_FOR_TEST = false; // ponelo en false para probar la TTF manuscrita
    const fontForName: "default" | "script" = USE_DEFAULT_FONT_FOR_TEST ? "default" : "script";

    let stampError: string | undefined = undefined;
    try {
      await stampReceipt({
        bucket: process.env.SUPABASE_BUCKET ?? "docs",
        pathInBucket: existing.filePath,
        debug: false,
        segments: [
          {
            lines: [signatureName],
            positions: [{ x: centerX, y: baseY }],
            font: "default",
            // 👇 Cargar desde Supabase (recomendado para serverless)
            fontSupabase: {
              bucket: process.env.SUPABASE_ASSETS_BUCKET || "assets",
              path: "fonts/GreatVibes-Regular.ttf",              
            },
            fontSize: 12,
            lineHeight: 16,
            centerX: true,
            maxWidth: 240,
          },
          {
            lines: [fechaLinea],
            positions: [{ x: centerX, y: baseY - 14 }],
            font: "default",
            fontSize: 9,
            lineHeight: 10,
            centerX: true,
          },
        ],
      });
    } catch (e: any) {
      console.error("[sign] stamping failed:", e?.message);
      stampError = e?.message || "unknown";
    }

    // Devolvemos info útil de prueba
    return NextResponse.json({
      ok: true,
      receipt: updated,
      signatureName,
      fontForName,
      debug: true,
      stampError,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
