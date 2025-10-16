// src/app/api/birthdays/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  fechaNacimiento: Date; // no null aquí
};

function toYMD(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // admite: month=2025-10  ó  year=2025&month=10  ó default (mes actual)
  const monthParam = searchParams.get("month"); // puede ser "2025-10" o "10"
  const yearParam = searchParams.get("year");   // "2025" cuando month=10

  let year: number;
  let monthIdx: number; // 0..11

  if (yearParam && monthParam && /^\d{1,2}$/.test(monthParam)) {
    // formato separado: ?year=2025&month=10
    year = parseInt(yearParam, 10);
    monthIdx = parseInt(monthParam, 10) - 1;
  } else if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    // formato combinado: ?month=2025-10
    const [yStr, mStr] = monthParam.split("-");
    year = parseInt(yStr, 10);
    monthIdx = parseInt(mStr, 10) - 1;
  } else {
    // default: mes actual (UTC)
    const now = new Date();
    year = now.getUTCFullYear();
    monthIdx = now.getUTCMonth();
  }

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIdx) ||
    monthIdx < 0 ||
    monthIdx > 11
  ) {
    return NextResponse.json({ error: "bad_month" }, { status: 400 });
  }

  // Traer usuarios con fechaNacimiento
  const users = await prisma.usuario.findMany({
    where: { fechaNacimiento: { not: null } },
    select: { id: true, nombre: true, apellido: true, fechaNacimiento: true },
  });

  const rows = (users as UserRow[])
    .map((u) => {
      const b = u.fechaNacimiento;     // fecha real de nacimiento
      const mm = b.getUTCMonth();      // 0..11
      const dd = b.getUTCDate();       // 1..31

      if (mm !== monthIdx) return null;

      // Ajuste 29/02 si el año no es bisiesto
      let day = dd;
      if (mm === 1 && dd === 29) {
        const isLeap =
          (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        if (!isLeap) day = 28;
      }

      const occ = new Date(Date.UTC(year, monthIdx, day));
      return {
        userId: u.id,
        fullName:
          [u.nombre, u.apellido].filter(Boolean).join(" ").trim() || "Usuario",
        date: toYMD(occ), // "YYYY-MM-DD"
      };
    })
    .filter(Boolean);

  return NextResponse.json({ items: rows });
}
