// /src/app/api/users/route.ts
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

const createUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  rolId: z.number().int().positive(),

  // Personales / contacto
  nombre: z.string().optional().nullable(),
  apellido: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  celular: z.string().optional().nullable(),
  domicilio: z.string().optional().nullable(),
  codigoPostal: z.string().optional().nullable(),

  // Identidad
  tipoDocumento: z.nativeEnum(TipoDocumento).optional().nullable(),
  documento: z.string().optional().nullable(),
  cuil: z.string().optional().nullable(),

  // Demográficos
  fechaNacimiento: z.coerce.date().optional().nullable(),
  genero: z.nativeEnum(Genero).optional().nullable(),
  estadoCivil: z.nativeEnum(EstadoCivil).optional().nullable(),
  nacionalidad: z.nativeEnum(Nacionalidad).optional().nullable(),
});

const sortWhitelist = new Set(["userId", "email", "nombre", "apellido", "createdAt"]);
type UserWithRole = Prisma.UsuarioGetPayload<{ include: { rol: true } }>;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
  const sortBy = sortWhitelist.has(searchParams.get("sortBy") || "")
    ? (searchParams.get("sortBy") as string)
    : "createdAt";
  const sortDir = (searchParams.get("sortDir") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const where = {
    deletedAt: null as any,
    ...(q
      ? {
          OR: [
            { userId: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { nombre: { contains: q, mode: "insensitive" } },
            { apellido: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const total = await prisma.usuario.count({ where });
  const items: UserWithRole[] = await prisma.usuario.findMany({
    where,
    include: { rol: true },
    orderBy: { [sortBy]: sortDir as "asc" | "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    data: items.map((u) => ({
      id: u.id,
      userId: u.userId,
      email: u.email,
      nombre: u.nombre,
      apellido: u.apellido,
      avatarUrl: u.avatarUrl,
      rol: u.rol ? { id: u.rol.id, nombre: u.rol.nombre } : null,
      createdAt: u.createdAt,

      // campos nuevos por si querés mostrarlos en la tabla o exportar
      tipoDocumento: u.tipoDocumento,
      documento: u.documento,
      cuil: u.cuil,
      celular: u.celular,
      domicilio: u.domicilio,
      codigoPostal: u.codigoPostal,
      fechaNacimiento: u.fechaNacimiento,
      genero: u.genero,
      estadoCivil: u.estadoCivil,
      nacionalidad: u.nacionalidad,
    })),
    meta: { total, page, pageSize, pageCount },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = createUserSchema.parse(body);

    // normalizaciones
    const email = dto.email.trim().toLowerCase();
    const userId = dto.userId.trim();
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // colisiones con activos
    const activeDup = await prisma.usuario.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email }, { userId }],
      },
      select: { id: true, email: true, userId: true },
    });
    if (activeDup) {
      const field =
        activeDup.email === email ? "email" :
        activeDup.userId === userId ? "userId" : "usuario";
      return NextResponse.json({ message: `Ya existe un ${field} activo con ese valor.` }, { status: 409 });
    }

    // ¿existe soft-deleted?
    const soft = await prisma.usuario.findFirst({
      where: { deletedAt: { not: null }, OR: [{ email }, { userId }] },
      select: { id: true },
    });

    const baseData = {
      userId,
      email,
      password: passwordHash,
      rolId: dto.rolId,

      nombre: dto.nombre ?? null,
      apellido: dto.apellido ?? null,
      avatarUrl: dto.avatarUrl ?? null,

      tipoDocumento: dto.tipoDocumento ?? null,
      documento: dto.documento ?? null,
      cuil: dto.cuil ?? null,

      celular: dto.celular ?? null,
      domicilio: dto.domicilio ?? null,
      codigoPostal: dto.codigoPostal ?? null,

      fechaNacimiento: dto.fechaNacimiento ?? null,
      genero: dto.genero ?? null,
      estadoCivil: dto.estadoCivil ?? null,
      nacionalidad: dto.nacionalidad ?? null,
    } as const;

    if (soft) {
      const revived = await prisma.usuario.update({
        where: { id: soft.id },
        data: { ...baseData, deletedAt: null },
        select: { id: true },
      });
      return NextResponse.json({ id: revived.id, revived: true });
    }

    const created = await prisma.usuario.create({
      data: baseData,
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, revived: false }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ message: err.issues.map((i: any) => i.message).join(", ") }, { status: 400 });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ message: "Ya existe un usuario con ese email/documento/cuil/userId." }, { status: 409 });
    }
    console.error("POST /api/users error:", err);
    return NextResponse.json({ message: "Error creando usuario" }, { status: 500 });
  }
}
