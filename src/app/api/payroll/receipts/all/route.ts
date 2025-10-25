// src/app/api/payroll/receipts/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import type { Prisma, Usuario, PayrollReceipt } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusFilter = "all" | "signed" | "unsigned" | "disagreement";

/* ---------- Helpers ---------- */
function parseMonthToDateStart(s?: string | null): Date | null {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;
  let y: number, m: number;
  if (/^\d{4}-\d{2}$/.test(t)) { y = Number(t.slice(0, 4)); m = Number(t.slice(5, 7)); }
  else if (/^\d{2}-\d{4}$/.test(t)) { m = Number(t.slice(0, 2)); y = Number(t.slice(3, 7)); }
  else return null;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return Number.isNaN(d.getTime()) ? null : d;
}

const digitsOnly = (s?: string | null) => (s ?? "").replace(/\D+/g, "");

/* ---------- Tipos slim ---------- */
type UserSlim = Pick<Usuario, "id" | "userId" | "email" | "nombre" | "apellido" | "cuil">;
type ReceiptSlim = Pick<
  PayrollReceipt,
  "id" | "cuil" | "period" | "periodDate" | "fileUrl" | "filePath" | "signed" | "signedDisagreement" | "observations" | "createdAt" | "updatedAt"
>;
type ReceiptWithStatus = ReceiptSlim & { status: "FIRMADO" | "DISCONFORMIDAD" | "PENDIENTE" };
type Group = { cuil: string; user: UserSlim | null; receipts: ReceiptWithStatus[] };

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const search = (url.searchParams.get("q") ?? "").trim();
  const status = (url.searchParams.get("status") as StatusFilter) || "all";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const fromDate = parseMonthToDateStart(from);
  const toDateStart = parseMonthToDateStart(to);
  const toDate = toDateStart
    ? new Date(Date.UTC(toDateStart.getUTCFullYear(), toDateStart.getUTCMonth() + 1, 0))
    : null;

  const where: Prisma.PayrollReceiptWhereInput = {};

  if (fromDate || toDate) {
    const periodFilter: Prisma.DateTimeFilter = {};
    if (fromDate) periodFilter.gte = fromDate;
    if (toDate) periodFilter.lte = toDate;
    where.periodDate = periodFilter;
  }

  if (status === "signed") {
    where.signed = true;
    where.signedDisagreement = false;
  } else if (status === "disagreement") {
    where.signedDisagreement = true;
  } else if (status === "unsigned") {
    where.signed = false;
    where.signedDisagreement = false;
  }

  if (search) {
    const cuilDigits = digitsOnly(search);
    const users = await prisma.usuario.findMany({
      where: {
        OR: [
          { apellido: { contains: search, mode: "insensitive" } },
          { nombre: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { userId: { contains: search, mode: "insensitive" } },
          ...(cuilDigits ? [{ cuil: { contains: cuilDigits } }] : []),
        ],
      },
      select: { cuil: true },
    });

    // ⬇️ Anotamos el tipo del parámetro y usamos un type guard en filter
    const cuils = users
      .map((u: { cuil: string | null }) => u.cuil)
      .filter((c: string | null): c is string => c !== null);

    where.OR = [
      ...(cuilDigits ? [{ cuil: { contains: cuilDigits } } as Prisma.PayrollReceiptWhereInput] : []),
      ...(cuils.length ? [{ cuil: { in: cuils } } as Prisma.PayrollReceiptWhereInput] : []),
    ];
  }

  const receipts: ReceiptSlim[] = await prisma.payrollReceipt.findMany({
    where,
    orderBy: [{ cuil: "asc" }, { periodDate: "desc" }],
    select: {
      id: true,
      cuil: true,
      period: true,
      periodDate: true,
      fileUrl: true,
      filePath: true,
      signed: true,
      signedDisagreement: true,
      observations: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const distinctCuils = Array.from(new Set(receipts.map((r) => r.cuil)));

  const users: UserSlim[] = await prisma.usuario.findMany({
    where: { cuil: { in: distinctCuils } },
    select: { id: true, userId: true, email: true, nombre: true, apellido: true, cuil: true },
  });

  const userByCuil = new Map<string, UserSlim>(
    users.map<[string, UserSlim]>((u: UserSlim) => [u.cuil!, u])
  );

  const groups: Group[] = distinctCuils.map((cuil) => {
    const recs: ReceiptWithStatus[] = receipts
      .filter((r) => r.cuil === cuil)
      .map<ReceiptWithStatus>((r) => ({
        ...r,
        status: r.signedDisagreement ? "DISCONFORMIDAD" : r.signed ? "FIRMADO" : "PENDIENTE",
      }));
    return { cuil, user: userByCuil.get(cuil) ?? null, receipts: recs };
  });

  const totals = receipts.length;
  const signed = receipts.filter((r) => r.signed && !r.signedDisagreement).length;
  const disagreement = receipts.filter((r) => r.signedDisagreement).length;
  const unsigned = totals - signed - disagreement;

  return NextResponse.json({
    summary: {
      totals,
      signed,
      disagreement,
      unsigned,
      coverage: totals ? Number(((signed + disagreement) / totals) * 100).toFixed(2) : "0.00",
    },
    groups,
  });
}
