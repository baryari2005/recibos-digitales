// /src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  EstadoCivil,
  Genero,
  Nacionalidad,
  TipoDocumento,
  Prisma,
} from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  userId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rolId: z.number().int().positive().optional(),

  nombre: z.string().nullable().optional(),
  apellido: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  celular: z.string().nullable().optional(),
  domicilio: z.string().nullable().optional(),
  codigoPostal: z.string().nullable().optional(),

  tipoDocumento: z.nativeEnum(TipoDocumento).nullable().optional(),
  documento: z.string().nullable().optional(),
  cuil: z.string().nullable().optional(),

  //fechaNacimiento: z.coerce.date().nullable().optional(),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado yyyy-MM-dd")
    .nullable()
    .optional(),
  genero: z.nativeEnum(Genero).nullable().optional(),
  estadoCivil: z.nativeEnum(EstadoCivil).nullable().optional(),
  nacionalidad: z.nativeEnum(Nacionalidad).nullable().optional(),
});

// 🔐 Siempre crear Date en UTC a partir de "yyyy-MM-dd"
function ymdToUTCDate(ymd?: string | null): Date | null {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)); // 00:00 UTC
}

// 🔐 Siempre serializar a string leyendo campos UTC
function toYmdUTC(d?: Date | null): string | null {
  if (!d) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// GET detalle
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const user = await prisma.usuario.findUnique({
    where: { id },
    include: { rol: true },
  });

  if (!user || user.deletedAt) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    userId: user.userId,
    email: user.email,
    rolId: user.rolId,
    rol: user.rol ? { id: user.rol.id, nombre: user.rol.nombre } : null,

    nombre: user.nombre,
    apellido: user.apellido,
    avatarUrl: user.avatarUrl,
    celular: user.celular,
    domicilio: user.domicilio,
    codigoPostal: user.codigoPostal,

    tipoDocumento: user.tipoDocumento,
    documento: user.documento,
    cuil: user.cuil,

    //    fechaNacimiento: user.fechaNacimiento,
    fechaNacimiento: toYmdUTC(user.fechaNacimiento),
    genero: user.genero,
    estadoCivil: user.estadoCivil,
    nacionalidad: user.nacionalidad,
  });
}

// PATCH
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;

  const toNull = (v: unknown) => (v === "" || v === undefined ? null : v);

  try {
    const body = await req.json();
    const dto = patchSchema.parse(body);

    const exists = await prisma.usuario.findUnique({ where: { id } });
    if (!exists || exists.deletedAt) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const data: any = { ...dto };

    if (dto.email) data.email = dto.email.toLowerCase().trim();
    if (dto.password) data.password = await bcrypt.hash(dto.password, 12);

    // normalización explícita de nulos / trims
    if ("nombre" in dto) data.nombre = toNull(dto.nombre)?.toString().trim() ?? null;
    if ("apellido" in dto) data.apellido = toNull(dto.apellido)?.toString().trim() ?? null;
    if ("avatarUrl" in dto) data.avatarUrl = toNull(dto.avatarUrl);
    if ("celular" in dto) data.celular = toNull(dto.celular);
    if ("domicilio" in dto) data.domicilio = toNull(dto.domicilio);
    if ("codigoPostal" in dto) data.codigoPostal = toNull(dto.codigoPostal);

    if ("tipoDocumento" in dto) data.tipoDocumento = dto.tipoDocumento ?? null;
    if ("documento" in dto) data.documento = toNull(dto.documento);
    if ("cuil" in dto) data.cuil = toNull(dto.cuil);

    //if ("fechaNacimiento" in dto) data.fechaNacimiento = dto.fechaNacimiento ?? null;
    if ("fechaNacimiento" in dto) {
      data.fechaNacimiento = ymdToUTCDate(dto.fechaNacimiento ?? null);
    }
    if ("genero" in dto) data.genero = dto.genero ?? null;
    if ("estadoCivil" in dto) data.estadoCivil = dto.estadoCivil ?? null;
    if ("nacionalidad" in dto) data.nacionalidad = dto.nacionalidad ?? null;

    const updated = await prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true },
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      email: updated.email,
      rol: updated.rol ? { id: updated.rol.id, nombre: updated.rol.nombre } : null,

      nombre: updated.nombre,
      apellido: updated.apellido,
      avatarUrl: updated.avatarUrl,
      celular: updated.celular,
      domicilio: updated.domicilio,
      codigoPostal: updated.codigoPostal,

      tipoDocumento: updated.tipoDocumento,
      documento: updated.documento,
      cuil: updated.cuil,

      fechaNacimiento: updated.fechaNacimiento,
      genero: updated.genero,
      estadoCivil: updated.estadoCivil,
      nacionalidad: updated.nacionalidad,
    });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = (e.meta?.target as string[] | undefined) ?? [];
      let message = "Existe otro registro con ese valor.";
      if (target.includes("email")) message = "El email ya está registrado.";
      if (target.includes("userId")) message = "El usuario (userId) ya existe.";
      if (target.includes("documento")) message = "El documento ya está registrado.";
      if (target.includes("cuil")) message = "El CUIL ya está registrado.";
      return NextResponse.json({ message }, { status: 409 });
    }
    const msg = e?.issues?.map((i: any) => i.message).join(", ") || e?.message || "Bad Request";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

// DELETE (soft delete) igual que ya tenías
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await prisma.usuario.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  await prisma.usuario.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
