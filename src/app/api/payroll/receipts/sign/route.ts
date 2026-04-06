import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerMe, requireAuth, requirePermission } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";
import { stampReceipt } from "@/lib/pdf/stamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServerMeUser = {
  id?: string | null;
  cuil?: string | null;
  cuilNumero?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  name?: string | null;
  email?: string | null;
};

type ServerMeShape = {
  user?: ServerMeUser | null;
};

type LegajoSignatureData = {
  usuario?: {
    nombre?: string | null;
    apellido?: string | null;
  } | null;
} | null;

function getSafeUser(value: unknown): ServerMeUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (!("user" in value)) {
    return null;
  }

  const user = (value as { user?: unknown }).user;

  if (!user || typeof user !== "object") {
    return null;
  }

  const candidate = user as Record<string, unknown>;

  return {
    id: typeof candidate.id === "string" ? candidate.id : null,
    cuil: typeof candidate.cuil === "string" ? candidate.cuil : null,
    cuilNumero:
      typeof candidate.cuilNumero === "string" ? candidate.cuilNumero : null,
    nombre: typeof candidate.nombre === "string" ? candidate.nombre : null,
    apellido: typeof candidate.apellido === "string" ? candidate.apellido : null,
    name: typeof candidate.name === "string" ? candidate.name : null,
    email: typeof candidate.email === "string" ? candidate.email : null,
  };
}

function fmtDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toTitle(s: string) {
  return (s ?? "")
    .toLowerCase()
    .replace(/\b(\p{L})/gu, (m) => m.toUpperCase());
}

function toSignatureName(full: string) {
  const parts = (full ?? "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${toTitle(parts[0])} ${toTitle(parts[parts.length - 1])}`;
  }
  return toTitle(full ?? "Empleado");
}

function pickSignatureName(
  me: ServerMeShape | null | undefined,
  legajo: LegajoSignatureData
) {
  const fromLegajo = [legajo?.usuario?.nombre, legajo?.usuario?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  const fromMeNA = [me?.user?.nombre, me?.user?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  const fromName = (me?.user?.name ?? "").trim();
  const fromEmail = (me?.user?.email ?? "")
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .trim();

  const raw = fromLegajo || fromMeNA || fromName || fromEmail || "Empleado";
  return toSignatureName(raw);
}

export async function PATCH(req: NextRequest) {
  try {
    const loggedInUser = await requireAuth(req);
    requirePermission(loggedInUser, "recibos", "firmar");

    const me = (await getServerMe(req)) as ServerMeShape | null;
    const user = getSafeUser(me);

    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, disagree, observations } = (await req.json()) as {
      id?: string;
      disagree?: boolean;
      observations?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const legajo = await prisma.legajo.findUnique({
      where: { usuarioId: userId },
      select: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    const rawCuil = user?.cuil || user?.cuilNumero;
    if (!rawCuil) {
      return NextResponse.json(
        { error: "CUIL no configurado" },
        { status: 400 }
      );
    }

    const cuil = cuilDashed(rawCuil);

    const existing = await prisma.payrollReceipt.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    if (existing.cuil !== cuil) {
      return NextResponse.json({ error: "No permitido" }, { status: 403 });
    }

    const updated = await prisma.payrollReceipt.update({
      where: { id },
      data: {
        signed: true,
        signedDisagreement: Boolean(disagree),
        observations:
          typeof observations === "string"
            ? observations
            : existing.observations,
      },
    });

    const signatureRaw = pickSignatureName(me, legajo);
    const signatureName = signatureRaw.trim() || "Empleado";

    const centerX = 330;
    const baseY = 42;

    const now = new Date();
    const fechaLinea = `Firmado el ${fmtDate(now)}${disagree ? " (NO CONFORME)" : ""}`;

    const USE_DEFAULT_FONT_FOR_TEST = false;
    const fontForName: "default" | "script" = USE_DEFAULT_FONT_FOR_TEST
      ? "default"
      : "script";

    let stampError: string | undefined;

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        stampError = error.message || "unknown";
      } else {
        stampError = "unknown";
      }
    }

    return NextResponse.json({
      ok: true,
      receipt: updated,
      signatureName,
      fontForName,
      debug: true,
      stampError,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}