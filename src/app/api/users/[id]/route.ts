import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { EstadoCivil, Genero, Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  userId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  nombre: z.string().nullable().optional(),
  apellido: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  rolId: z.number().int().positive().optional(),
  // 🆕 si añadiste estos campos:
  fechaNacimiento: z.coerce.date().nullable().optional(),
  genero: z.nativeEnum(Genero).nullable().optional(),
  estadoCivil: z.nativeEnum(EstadoCivil).nullable().optional(),
  nacionalidad: z.string().max(100).nullable().optional(),
});

// GET detalle
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // 👈 await acá

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
    nombre: user.nombre,
    apellido: user.apellido,
    firstName: user.nombre,
    lastName: user.apellido,
    avatarUrl: user.avatarUrl,
    rolId: user.rolId,
    rol: user.rol ? { id: user.rol.id, nombre: user.rol.nombre } : null,
    // si agregaste estos campos en el modelo:
    fechaNacimiento: user.fechaNacimiento,
    genero: user.genero,
    estadoCivil: user.estadoCivil,
    nacionalidad: user.nacionalidad,
  });
}

// PATCH
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params; // 👈 await acá

  const toNull = (v: unknown) =>
    v === "" || v === undefined ? null : v;
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

    // normalización de opcionales (si los usás)
    if ("fechaNacimiento" in dto) data.fechaNacimiento = dto.fechaNacimiento ?? null;
    if ("genero" in dto) data.genero = toNull(dto.genero);
    if ("estadoCivil" in dto) data.estadoCivil = toNull(dto.estadoCivil);
    if ("nacionalidad" in dto) data.nacionalidad = toNull(dto.nacionalidad)?.toString().trim() || null;

    console.log("[DATA]", data);
    console.log("[id]", id);

    const updated = await prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true },
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      email: updated.email,
      nombre: updated.nombre,
      apellido: updated.apellido,
      avatarUrl: updated.avatarUrl,
      rol: updated.rol ? { id: updated.rol.id, nombre: updated.rol.nombre } : null,
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
      return NextResponse.json({ message }, { status: 409 });
    }
    const msg = e?.issues?.map((i: any) => i.message).join(", ") || e?.message || "Bad Request";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

// DELETE (soft delete)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // 👈 await acá

  const user = await prisma.usuario.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  await prisma.usuario.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
