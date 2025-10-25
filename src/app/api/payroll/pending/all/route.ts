// src/app/api/payroll/pending/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";
import { createClient } from "@supabase/supabase-js";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReceiptRow = Prisma.PayrollReceiptGetPayload<{
  select: {
    id: true;
    cuil: true;
    period: true;
    periodDate: true;
    filePath: true;
    fileUrl: true;
    signed: true;
    signedDisagreement: true;
    observations: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wantSigned = String(searchParams.get("signed") ?? "false") === "true";
    const limitParam = Math.max(1, Math.min(500, Number(searchParams.get("limit") ?? 100)));

    const me = await getServerMe(req);
    const userId = me?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const rawCuil = (me as any)?.user?.cuil || (me as any)?.user?.cuilNumero;
    if (!rawCuil) return NextResponse.json({ error: "CUIL no configurado en tu perfil." }, { status: 400 });

    const cuil = cuilDashed(rawCuil);
    const receipts: ReceiptRow[] = await prisma.payrollReceipt.findMany({
      where: { cuil, signed: false },          // <- usa 'signed'
      select: {
        id: true, cuil: true, period: true, periodDate: true,
        filePath: true, fileUrl: true,
        signed: true, signedDisagreement: true, observations: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: [{ periodDate: "desc" }, { createdAt: "desc" }],
      take: limitParam,
    });

    if (!wantSigned) {
      return NextResponse.json({
        ok: true, cuil, count: receipts.length,
        items: receipts.map((r: ReceiptRow) => ({ ...r, signedUrl: undefined })),
      });
    }

    // Firmar URLs si el bucket es privado (o si fileUrl está vacío)
    const bucket = process.env.SUPABASE_BUCKET || "docs";
    const needSigning: ReceiptRow[] = receipts.filter(
      (r): r is ReceiptRow => !r.fileUrl || !r.fileUrl.includes("/storage/v1/object/public/")
    );

    const signedMap = new Map<string, string>();
    if (needSigning.length > 0) {
      const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      for (const r of needSigning) {
        const { data, error } = await supa.storage.from(bucket).createSignedUrl(r.filePath, 3600);
        if (!error && data?.signedUrl) signedMap.set(r.id, data.signedUrl);
      }
    }

    return NextResponse.json({
      ok: true, cuil, count: receipts.length,
      items: receipts.map(
        (r): ReceiptRow & { signedUrl: string | null } => ({
          ...r,
          signedUrl:
            r.fileUrl && r.fileUrl.includes("/storage/v1/object/public/")
              ? r.fileUrl
              : signedMap.get(r.id) ?? null,
        })
      ),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 });
  }
}
