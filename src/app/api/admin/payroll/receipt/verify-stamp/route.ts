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

type NamedUserShape = {
  user?: {
    id?: string;
    nombre?: string;
    apellido?: string;
  } | null;
};

function hasNamedUser(value: unknown): value is NamedUserShape {
  if (!value || typeof value !== "object") return false;
  if (!("user" in value)) return false;

  const maybeUser = value.user;

  if (maybeUser == null) return true;
  if (typeof maybeUser !== "object") return false;

  const nombreOk =
    !("nombre" in maybeUser) ||
    typeof maybeUser.nombre === "string" ||
    typeof maybeUser.nombre === "undefined";

  const apellidoOk =
    !("apellido" in maybeUser) ||
    typeof maybeUser.apellido === "string" ||
    typeof maybeUser.apellido === "undefined";

  const idOk =
    !("id" in maybeUser) ||
    typeof maybeUser.id === "string" ||
    typeof maybeUser.id === "undefined";

  return nombreOk && apellidoOk && idOk;
}

export async function GET(req: NextRequest) {
  const me = await getServerMe(req);

  if (!hasNamedUser(me) || !me.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const receipt = await prisma.payrollReceipt.findUnique({
    where: { id },
  });

  if (!receipt) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const bucket = process.env.SUPABASE_BUCKET || "docs";
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const dl = await supa.storage.from(bucket).download(receipt.filePath);

  if (dl.error) {
    return NextResponse.json({ error: dl.error.message }, { status: 500 });
  }

  const buf = Buffer.from(await dl.data.arrayBuffer());
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const parsed = await pdfParse(buf);
  const text = (parsed?.text || "").replace(/\s+/g, " ");

  const needles = [
    "Firmado el",
    me.user?.nombre ?? "",
    me.user?.apellido ?? "",
  ].filter((value): value is string => value.trim().length > 0);

  const hits = needles
    .map((needle) => ({
      needle,
      snippet: pickSnippet(text, needle),
    }))
    .filter(
      (hit): hit is { needle: string; snippet: string } => hit.snippet !== null
    );

  return NextResponse.json({
    ok: true,
    filePath: receipt.filePath,
    found: hits.length > 0,
    hits,
  });
}