import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { EstadoCivil, Genero, Prisma } from "@prisma/client";              // 👈 importa tipos de Prisma


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().optional().nullable(),
  apellido: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  rolId: z.number().int().positive(),
  fechaNacimiento: z.coerce.date().optional().nullable(),
  genero: z.enum(Genero).optional().nullable(),
  estadoCivil: z.enum(EstadoCivil).optional().nullable(),
  nacionalidad: z.string().max(100).optional().nullable(),
});

const sortWhitelist = new Set(["userId", "email", "nombre", "apellido", "createdAt"]);

// 👇 definí un alias de tipo para “usuario con rol”
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
    data: items.map((u) => ({                       // 👈 ahora TS conoce el tipo de u
      id: u.id,
      userId: u.userId,
      email: u.email,
      nombre: u.nombre,
      apellido: u.apellido,
      avatarUrl: u.avatarUrl,
      rol: u.rol ? { id: u.rol.id, nombre: u.rol.nombre } : null,
      createdAt: u.createdAt,
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
    const nombre = (dto.nombre ?? null) || null;
    const apellido = (dto.apellido ?? null) || null;
    const rolId = dto.rolId ?? 1;
    const fechaNacimiento = dto.fechaNacimiento ?? null; // z.coerce.date() ya te entrega Date
    const genero = dto.genero ?? null;
    const estadoCivil = dto.estadoCivil ?? null;
    const nacionalidad = (dto.nacionalidad ?? null) ? (dto.nacionalidad as string).trim() : null;

    // 1) ¿Existe un usuario ACTIVO con mismo email o userId?
    const activeDup = await prisma.usuario.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email }, { userId }],
      },
      select: { id: true, email: true, userId: true },
    });

    if (activeDup) {
      // Elegí un mensaje útil para el front (tu form ya mapea 409 -> setError)
      const field =
        activeDup.email === email ? "email" :
          activeDup.userId === userId ? "userId" :
            "usuario";
      return NextResponse.json(
        { message: `Ya existe un ${field} activo con ese valor.` },
        { status: 409 }
      );
    }

    // 2) ¿Existe un usuario SOFT-DELETED con ese email o userId?
    const soft = await prisma.usuario.findFirst({
      where: {
        deletedAt: { not: null },
        OR: [{ email }, { userId }],
      },
      select: { id: true },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);

    if (soft) {
      // 3) Reactivar ese mismo registro (evita chocar la unique constraint)
      const revived = await prisma.usuario.update({
        where: { id: soft.id },
        data: {
          userId,
          email,
          password: passwordHash,
          nombre,
          apellido,
          rolId,
          avatarUrl: dto.avatarUrl ?? undefined,
          deletedAt: null,
          fechaNacimiento,
          genero,
          estadoCivil,
          nacionalidad,
        },
        select: { id: true },
      });

      return NextResponse.json({ id: revived.id, revived: true });
    }

    // 4) Si no hay ni activo ni soft-deleted, creamos uno nuevo
    const created = await prisma.usuario.create({
      data: {
        userId,
        email,
        password: passwordHash,
        nombre,
        apellido,
        rolId,
        avatarUrl: dto.avatarUrl ?? undefined,
        fechaNacimiento,
        genero,
        estadoCivil,
        nacionalidad,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, revived: false }, { status: 201 });
  } catch (err: any) {
    // zod
    if (err?.issues) {
      return NextResponse.json(
        { message: err.issues.map((i: any) => i.message).join(", ") },
        { status: 400 }
      );
    }
    // prisma unique (por si vuelve a colarse algo)
    if (err?.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un usuario con ese email o userId." },
        { status: 409 }
      );
    }
    console.error("POST /api/users error:", err);
    return NextResponse.json({ message: "Error creando usuario" }, { status: 500 });
  }
}
