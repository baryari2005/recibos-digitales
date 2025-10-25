// src/app/api/users/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";
import type { Usuario, Legajo } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- Helpers ---------- */

// YYYY-MM-DD (UTC)
const toYMD = (d?: Date | null) => {
  if (!d) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// "mAbel aLiCia doMinguez" → "Mabel Alicia Dominguez"
const titleCase = (raw?: string | null): string | null => {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  const cap = (w: string) =>
    w
      .split("-")
      .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
      .join("-");
  return s.split(/\s+/).map(cap).join(" ");
};

// XX-XXXXXXXX-X si tiene 11 dígitos
const formatCuil = (v?: string | null): string | null => {
  if (!v) return null;
  const d = v.replace(/\D+/g, "");
  if (d.length !== 11) return v;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
};

/* ---------- Tipos de filas ---------- */
type UserRow = {
  userId: string | null;
  email: string;
  nombre: string | null;
  apellido: string | null;
  nombreCompleto: string;
  fechaNacimiento: string | null;
  genero: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  tipoDocumento: string | null;
  documento: string | null;
  cuil: string | null;
  celular: string | null;
  domicilio: string | null;
  codigoPostal: string | null;
  rolId: number;
  createdAt: string;
  updatedAt: string;
};

type LegajoRow = {
  userId: string | null;
  numeroLegajo: number | null;
  fechaIngreso: string | null;
  fechaEgreso: string | null;
  estadoLaboral: string | null;
  tipoContrato: string | null;
  puesto: string | null;
  area: string | null;
  departamento: string | null;
  categoria: string | null;
  matriculaProvincial: string | null;
  matriculaNacional: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function GET(_req: NextRequest) {
  const started = Date.now();

  // Tipamos explícitamente el resultado para evitar any
  const usuarios: (Usuario & { legajo: Legajo | null })[] = await prisma.usuario.findMany({
    include: { legajo: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });

  // ---- Sheet 1: Usuarios ----
  const usersRows: UserRow[] = usuarios.map((u: Usuario & { legajo: Legajo | null }) => ({
    userId: u.userId,
    email: u.email,
    nombre: titleCase(u.nombre),
    apellido: titleCase(u.apellido),
    nombreCompleto: [titleCase(u.apellido) ?? "", titleCase(u.nombre) ?? ""].join(" ").trim(),
    fechaNacimiento: toYMD(u.fechaNacimiento),
    genero: (u.genero as string) ?? null,
    estadoCivil: (u.estadoCivil as string) ?? null,
    nacionalidad: (u.nacionalidad as string) ?? null,
    tipoDocumento: (u.tipoDocumento as string) ?? null,
    documento: u.documento ?? null,
    cuil: formatCuil(u.cuil),
    celular: u.celular ?? null,
    domicilio: u.domicilio ?? null,
    codigoPostal: u.codigoPostal ?? null,
    rolId: u.rolId,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  // ---- Sheet 2: Legajos ----
  const legajosRows: LegajoRow[] = usuarios
    .filter((u) => !!u.legajo)
    .map((u: Usuario & { legajo: Legajo | null }) => {
      const l = u.legajo as Legajo;
      return {
        userId: u.userId,
        numeroLegajo: l.numeroLegajo ?? null,
        fechaIngreso: toYMD(l.fechaIngreso),
        fechaEgreso: toYMD(l.fechaEgreso),
        estadoLaboral: (l.estadoLaboral as unknown as string) ?? null,
        tipoContrato: (l.tipoContrato as unknown as string) ?? null,
        puesto: l.puesto ?? null,
        area: l.area ?? null,
        departamento: l.departamento ?? null,
        categoria: l.categoria ?? null,
        matriculaProvincial: l.matriculaProvincial ?? null,
        matriculaNacional: l.matriculaNacional ?? null,
        observaciones: l.observaciones ?? null,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      };
    });

  // Armar workbook
  const wb = XLSX.utils.book_new();
  const wsUsers = XLSX.utils.json_to_sheet(usersRows);
  const wsLeg = XLSX.utils.json_to_sheet(legajosRows);
  XLSX.utils.book_append_sheet(wb, wsUsers, "Usuarios");
  XLSX.utils.book_append_sheet(wb, wsLeg, "Legajos");

  // ArrayBuffer (compatible con NextResponse)
  const ab = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

  // Stats
  const elapsedMs = Date.now() - started;
  const usersCount = usuarios.length;
  const legajosCount = legajosRows.length;

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const filename = `export_usuarios_legajos_${stamp}.xlsx`;

  return new NextResponse(ab, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(ab.byteLength),
      "X-Users-Count": String(usersCount),
      "X-Legajos-Count": String(legajosCount),
      "X-Elapsed-Ms": String(elapsedMs),
    },
  });
}
