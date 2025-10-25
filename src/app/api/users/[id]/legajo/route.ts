// /src/app/api/users/[id]/legajo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { z } from "zod";
import { EstadoLaboral, TipoContrato } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------- zod (mismo shape que el form) ---------------- */
const legajoSchema = z.object({
  employeeNumber: z.number().int().positive().optional().nullable(),
  admissionDate: z.string().optional().nullable(),
  terminationDate: z.string().optional().nullable(),
  employmentStatus: z.nativeEnum(EstadoLaboral),
  contractType: z.nativeEnum(TipoContrato).optional().nullable(),
  position: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  matriculaProvincial: z.string().optional().nullable(),
  matriculaNacional: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).strict();

/* ---------------- Helpers fecha UTC ---------------------------- */
function toYMD(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromYMD(s?: string | null) {
  return s && s.trim() ? new Date(`${s}T00:00:00.000Z`) : null;
}

function emptyToNull(s?: string | null) {
  return s && s.trim() ? s.trim() : null;
}

/* ---------------- Map DB -> DTO ----------------- */
function mapDbToDto(l: any) {
  return {
    employeeNumber: l.numeroLegajo ?? null,
    admissionDate: l.fechaIngreso ? toYMD(l.fechaIngreso) : null,
    terminationDate: l.fechaEgreso ? toYMD(l.fechaEgreso) : null,
    employmentStatus: l.estadoLaboral,
    contractType: l.tipoContrato ?? null,
    position: l.puesto ?? null,
    area: l.area ?? null,
    department: l.departamento ?? null,
    category: l.categoria ?? null,
    matriculaProvincial: l.matriculaProvincial ?? null, // 👈
    matriculaNacional: l.matriculaNacional ?? null,   // 👈
    notes: l.observaciones ?? null,
  };
}

/* ---------------- Map DTO -> DB ------------------ */
function mapDtoToDb(dto: z.infer<typeof legajoSchema>) {
  return {
    numeroLegajo: dto.employeeNumber ?? null,
    fechaIngreso: fromYMD(dto.admissionDate),
    fechaEgreso: fromYMD(dto.terminationDate),
    estadoLaboral: dto.employmentStatus,
    tipoContrato: dto.contractType ?? null,
    puesto: dto.position ?? null,
    area: dto.area ?? null,
    departamento: dto.department ?? null,
    categoria: dto.category ?? null,
    matriculaProvincial: emptyToNull(dto.matriculaProvincial), // 👈
    matriculaNacional: emptyToNull(dto.matriculaNacional),    // 👈
    observaciones: dto.notes ?? null,
  };
}

/* ============================ GET ============================== */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const user = await prisma.usuario.findUnique({ where: { id } });
  if (!user || user.deletedAt) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  const f = await prisma.legajo.findUnique({ where: { usuarioId: id } });
  if (!f) return NextResponse.json(null);

  return NextResponse.json(mapDbToDto(f));
}

/* ============ Upsert común (POST/PUT/PATCH llaman aquí) ========= */
async function upsertLegajo(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;

  const user = await prisma.usuario.findUnique({ where: { id } });
  if (!user || user.deletedAt) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "bad_request", message: "JSON body requerido" }, { status: 400 });
  }

  let dto: z.infer<typeof legajoSchema>;
  try {
    dto = legajoSchema.parse(body);
  } catch (err) {
    console.error("Legajo Zod error:", err);
    return NextResponse.json({ error: "validation_error", details: err }, { status: 400 });
  }

  const data = { usuarioId: id, ...mapDtoToDb(dto) };
  console.log("UPD LEG: PAYLOAD", body);
  console.log("UPD LEG: DTO", dto);
  console.log("UPD LEG: DATA", { matriculaProvincial: data.matriculaProvincial, matriculaNacional: data.matriculaNacional });

  const saved = await prisma.legajo.upsert({
    where: { usuarioId: id },
    update: data,
    create: data,
  });

  return NextResponse.json(mapDbToDto(saved));
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return upsertLegajo(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return upsertLegajo(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return upsertLegajo(req, ctx);
}
