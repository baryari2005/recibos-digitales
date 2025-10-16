import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------- zod (mismo shape que el form) ---------------- */
const legajoSchema = z.object({
  employeeNumber: z.number().int().positive().optional().nullable(),
  documentType: z.enum(["DNI", "PAS", "LE", "LC", "CI"]).optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  cuil: z.string().optional().nullable(),
  admissionDate: z.string().optional().nullable(),   // "YYYY-MM-DD"
  terminationDate: z.string().optional().nullable(), // "YYYY-MM-DD"
  employmentStatus: z.enum(["ACTIVO", "SUSPENDIDO", "LICENCIA", "BAJA"]),
  contractType: z.enum(["INDETERMINADO", "PLAZO_FIJO", "TEMPORAL", "PASANTIA", "MONOTRIBUTO"]).optional().nullable(),
  position: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/* ---------------- Helpers de fecha (sin drift de TZ) ----------- */
function toYMD(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // "YYYY-MM-DD"
}
function fromYMD(s?: string | null) {
  return s && s.trim() ? new Date(`${s}T00:00:00.000Z`) : null;
}

/* ---------------- Map DB -> DTO (para el form) ----------------- */
function mapDbToDto(l: any) {
  return {
    employeeNumber: l.numeroLegajo ?? null,
    documentType: l.tipoDocumento ?? null,
    documentNumber: l.documento ?? null,
    cuil: l.cuil ?? null,
    admissionDate: l.fechaIngreso ? toYMD(l.fechaIngreso) : null,
    terminationDate: l.fechaEgreso ? toYMD(l.fechaEgreso) : null,
    employmentStatus: l.estadoLaboral,
    contractType: l.tipoContrato ?? null,
    position: l.puesto ?? null,
    area: l.area ?? null,
    department: l.departamento ?? null,
    category: l.categoria ?? null,
    notes: l.observaciones ?? null,
  };
}

/* ---------------- Map DTO -> DB (para Prisma) ------------------ */
function mapDtoToDb(dto: z.infer<typeof legajoSchema>) {
  return {
    numeroLegajo: dto.employeeNumber ?? null,
    tipoDocumento: dto.documentType ?? null,
    documento: dto.documentNumber ?? null,
    cuil: dto.cuil ?? null,
    fechaIngreso: fromYMD(dto.admissionDate),
    fechaEgreso: fromYMD(dto.terminationDate),
    estadoLaboral: dto.employmentStatus,
    tipoContrato: dto.contractType ?? null,
    puesto: dto.position ?? null,
    area: dto.area ?? null,
    departamento: dto.department ?? null,
    categoria: dto.category ?? null,
    observaciones: dto.notes ?? null,
  };
}

/* ============================ GET ============================== */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }   // 👈 params debe esperarse
) {
  const authz = req.headers.get("authorization");
  console.log("[legajo][GET] url:", req.nextUrl.pathname);
  console.log("[legajo][GET] has Authorization?", !!authz);

  const { id } = await ctx.params;  // 👈 evita el warning de Next
  console.log("[legajo][GET] userId:", id);

  // (opcional) proteger GET también:
  // const auth = await requireAdmin(req);
  // if (!auth.ok) return auth.res;

  try {
    const user = await prisma.usuario.findUnique({ where: { id } });
    console.log("[legajo][GET] usuario existe?", !!user, "deletedAt?", !!user?.deletedAt);

    if (!user || user.deletedAt) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const f = await prisma.legajo.findUnique({ where: { usuarioId: id } });
    console.log("[legajo][GET] legajo existe?", !!f);

    if (!f) return NextResponse.json(null);

    const dto = mapDbToDto(f);
    console.log("[legajo][GET] dto:", dto);
    return NextResponse.json(dto);
  } catch (e: any) {
    console.error("[legajo][GET] error:", e?.message || e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/* ============ Upsert común (POST/PUT/PATCH llaman aquí) ========= */
async function upsertLegajo(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  console.log("[legajo][UPSERT] url:", req.nextUrl.pathname, "method:", req.method);
  console.log("[legajo][UPSERT] has Authorization?", !!req.headers.get("authorization"));

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    console.log("[legajo][UPSERT] requireAdmin -> NOT OK (401/403)");
    return auth.res;
  }
  console.log("[legajo][UPSERT] requireAdmin -> OK, role=admin");

  const { id } = await ctx.params;
  console.log("[legajo][UPSERT] userId:", id);

  try {
    const user = await prisma.usuario.findUnique({ where: { id } });
    console.log("[legajo][UPSERT] usuario existe?", !!user, "deletedAt?", !!user?.deletedAt);
    if (!user || user.deletedAt) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    console.log("[legajo][UPSERT] body keys:", body && Object.keys(body));
    if (!body) {
      return NextResponse.json({ error: "bad_request", message: "JSON body requerido" }, { status: 400 });
    }

    const dto = legajoSchema.parse(body);
    const data = { usuarioId: id, ...mapDtoToDb(dto) };

    console.log("[legajo][UPSERT] prisma.upsert data:", data);
    const saved = await prisma.legajo.upsert({
      where: { usuarioId: id },
      update: data,
      create: data,
    });

    const dtoOut = mapDbToDto(saved);
    console.log("[legajo][UPSERT] OK -> dto:", dtoOut);
    return NextResponse.json(dtoOut);
  } catch (e: any) {
    if (e?.issues) {
      console.error("[legajo][UPSERT] zod error:", e.issues);
      const msg = e.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error: "bad_request", message: msg }, { status: 400 });
    }
    console.error("[legajo][UPSERT] error:", e?.message || e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
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
