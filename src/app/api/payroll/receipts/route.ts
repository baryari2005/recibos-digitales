import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed } from "@/lib/cuil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = Prisma.PayrollReceiptGetPayload<{
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

type ServerMeUser = {
  id?: string | null;
  cuil?: string | null;
  cuilNumero?: string | null;
};

type PayrollReceiptWithView = Row & {
  viewUrl: string | null;
  viewVersion: number | null;
};

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
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wantSigned =
      String(searchParams.get("signed") ?? "false") === "true";
    const limit = Math.max(
      1,
      Math.min(1000, Number(searchParams.get("limit") ?? 500))
    );

    const me = await getServerMe(req);
    const user = getSafeUser(me);
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawCuil = user.cuil || user.cuilNumero;

    if (!rawCuil) {
      return NextResponse.json(
        { error: "CUIL no configurado" },
        { status: 400 }
      );
    }

    const cuil = cuilDashed(rawCuil);

    const rows: Row[] = await prisma.payrollReceipt.findMany({
      where: { cuil },
      select: {
        id: true,
        cuil: true,
        period: true,
        periodDate: true,
        filePath: true,
        fileUrl: true,
        signed: true,
        signedDisagreement: true,
        observations: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ periodDate: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    if (!wantSigned) {
      return NextResponse.json(
        {
          ok: true,
          cuil,
          pending: rows.filter((row) => !row.signed),
          signed: rows.filter((row) => row.signed),
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const bucket = process.env.SUPABASE_BUCKET || "docs";

    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const isPublic = (url?: string | null) =>
      !!url && url.includes("/storage/v1/object/public/");

    const addBuster = (url: string, version: number | string) =>
      `${url}${url.includes("?") ? "&" : "?"}v=${version}`;

    const needSigning = rows.filter((row) => !isPublic(row.fileUrl));
    const signedMap = new Map<string, string>();

    for (const row of needSigning) {
      const { data, error } = await supa.storage
        .from(bucket)
        .createSignedUrl(row.filePath, 3600);

      if (!error && data?.signedUrl) {
        signedMap.set(row.id, data.signedUrl);
      }
    }

    async function getStorageVersion(row: Row): Promise<number> {
      const baseUrl = isPublic(row.fileUrl)
        ? row.fileUrl!
        : (signedMap.get(row.id) ?? null);

      if (!baseUrl) {
        return 0;
      }

      try {
        const response = await fetch(baseUrl, {
          method: "HEAD",
          cache: "no-store",
        });

        const lastModified = response.headers.get("last-modified");

        return lastModified ? new Date(lastModified).getTime() : 0;
      } catch {
        return 0;
      }
    }

    const withUrl = async (row: Row): Promise<PayrollReceiptWithView> => {
      const baseUrl = isPublic(row.fileUrl)
        ? row.fileUrl!
        : (signedMap.get(row.id) ?? null);

      if (!baseUrl) {
        return {
          ...row,
          viewUrl: null,
          viewVersion: null,
        };
      }

      const versionFromDb = new Date(row.updatedAt).getTime();
      const versionFromStorage = await getStorageVersion(row);
      const version = Math.max(versionFromDb, versionFromStorage, Date.now());

      return {
        ...row,
        viewUrl: addBuster(baseUrl, version),
        viewVersion: version,
      };
    };

    const pending = await Promise.all(
      rows.filter((row) => !row.signed).map(withUrl)
    );

    const signed = await Promise.all(
      rows.filter((row) => row.signed).map(withUrl)
    );

    return NextResponse.json(
      {
        ok: true,
        cuil,
        pending,
        signed,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected error",
      },
      { status: 500 }
    );
  }
}