import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";
import { createClient } from "@supabase/supabase-js";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = Prisma.PayrollReceiptGetPayload<{
  select: {
    id: true; cuil: true; period: true; periodDate: true;
    filePath: true; fileUrl: true;
    signed: true; signedDisagreement: true;
    observations: true; createdAt: true; updatedAt: true;
  };
}>;

export async function GET(req: NextRequest) {
  try {
    console.log("entre");

    const { searchParams } = new URL(req.url);
    const wantSigned = String(searchParams.get("signed") ?? "false") === "true";
    const limit = Math.max(1, Math.min(1000, Number(searchParams.get("limit") ?? 500)));

    const me = await getServerMe(req);
    const userId = me?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // CUIL del usuario
    const legajo = await prisma.legajo.findUnique({
      where: { usuarioId: userId },
      select: { cuil: true },
    });
    const rawCuil = legajo?.cuil || (me as any)?.user?.cuil || (me as any)?.user?.cuilNumero;
    if (!rawCuil) return NextResponse.json({ error: "CUIL no configurado" }, { status: 400 });
    const cuil = cuilDashed(rawCuil);

    // Traemos TODO y separamos por signed
    const rows: Row[] = await prisma.payrollReceipt.findMany({
      where: { cuil },
      select: {
        id: true, cuil: true, period: true, periodDate: true,
        filePath: true, fileUrl: true,
        signed: true, signedDisagreement: true,
        observations: true, createdAt: true, updatedAt: true,
      },
      orderBy: [{ periodDate: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    // Si no se piden signed URLs, devolvemos directo
    if (!wantSigned) {
      return NextResponse.json(
        { ok: true, cuil, pending: rows.filter(r => !r.signed), signed: rows.filter(r => r.signed) },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // ---- helpers para firma de URL y versión anti-cache
    const bucket = process.env.SUPABASE_BUCKET || "docs";
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const isPublic = (u?: string | null) => !!u && u.includes("/storage/v1/object/public/");
    const addBuster = (u: string, v: number | string) => `${u}${u.includes("?") ? "&" : "?"}v=${v}`;

    // Firmamos sólo las privadas
    const needSigning = rows.filter(r => !isPublic(r.fileUrl));
    const signedMap = new Map<string, string>();
    for (const r of needSigning) {
      const { data, error } = await supa.storage.from(bucket).createSignedUrl(r.filePath, 3600);
      if (!error && data?.signedUrl) signedMap.set(r.id, data.signedUrl);
    }

    // Para cada archivo, obtenemos su Last-Modified del Storage
    async function getStorageVersion(r: Row): Promise<number> {
      const baseUrl = isPublic(r.fileUrl) ? r.fileUrl! : (signedMap.get(r.id) || null);
      if (!baseUrl) return 0;
      try {
        const resp = await fetch(baseUrl, { method: "HEAD", cache: "no-store" });
        const lm = resp.headers.get("last-modified");
        return lm ? new Date(lm).getTime() : 0;
      } catch {
        return 0;
      }
    }

    // Construimos cada item con URL y versión = max(DB.updatedAt, Storage.lastModified)
    const withUrl = async (r: Row) => {
      const baseUrl = isPublic(r.fileUrl) ? r.fileUrl! : (signedMap.get(r.id) || null);
      if (!baseUrl) return { ...r, viewUrl: null, viewVersion: null as any };

      const verDb = new Date(r.updatedAt).getTime();
      const verSt = await getStorageVersion(r);
      const ver = Math.max(verDb, verSt, Date.now()); // siempre avanza

      return { ...r, viewUrl: addBuster(baseUrl, ver), viewVersion: ver };
    };

    const pending = await Promise.all(rows.filter(r => !r.signed).map(withUrl));
    const signed = await Promise.all(rows.filter(r =>  r.signed).map(withUrl));

    return NextResponse.json(
      { ok: true, cuil, pending, signed },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 });
  }
}
