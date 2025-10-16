// src/app/api/users/import-upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { EstadoCivil, Genero, Nacionalidad, Prisma, } from "@prisma/client";
import { z, ZodError } from "zod";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

const bodySchema = z.object({
  user: z.object({
    userId: z.string().trim().optional(),
    email: z.string().email().optional(),
    nombre: z.string().optional().nullable(),
    apellido: z.string().optional().nullable(),
    rolId: z.number().int().positive().optional(),

    // "YYYY-MM-DD" o ISO
    fechaNacimiento: z.string().optional().nullable(),

    genero: z.nativeEnum(Genero).optional().nullable(),
    estadoCivil: z.nativeEnum(EstadoCivil).optional().nullable(),
    nacionalidad: z.nativeEnum(Nacionalidad).optional().nullable(),

    // si viene, se usa; si no, se genera
    password: z.string().optional(),
  }),
  legajo: z.object({
    employeeNumber: z.number().int().positive().optional().nullable(),
    documentType: z.enum(["DNI", "PAS", "LE", "LC", "CI"]).optional().nullable(),
    documentNumber: z.string().optional().nullable(),
    cuil: z.string().optional().nullable(),
    admissionDate: z.string().optional().nullable(),   // YYYY-MM-DD o ISO
    terminationDate: z.string().optional().nullable(), // YYYY-MM-DD o ISO
    employmentStatus: z.enum(["ACTIVO", "SUSPENDIDO", "LICENCIA", "BAJA"]).optional(),
    contractType: z.enum(["INDETERMINADO", "PLAZO_FIJO", "TEMPORAL", "PASANTIA", "MONOTRIBUTO"]).optional().nullable(),
    position: z.string().optional().nullable(),
    area: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }).optional(),
});

// -------- helpers
const normalizeEmail = (e?: string | null) => (e ?? "").trim().toLowerCase() || undefined;
const normalizeCuil  = (v?: string | null) => (v ?? "").replace(/\D+/g, "") || undefined;

const toYMD = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

/** Acepta "YYYY-MM-DD" O un ISO y devuelve Date o null */
const fromYMDorISO = (s?: string | null): Date | null => {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;

  // Si ya es ISO válido
  const iso = new Date(t);
  if (!Number.isNaN(iso.getTime())) return iso;

  // Si es "YYYY-MM-DD", armo un ISO "YYYY-MM-DDT00:00:00.000Z"
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const d = new Date(`${t}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
};

// query flags
// ?setTemp=1 → si el usuario ya existe, *resetea* contraseña y la devuelve como tempPassword
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const setTemp = url.searchParams.get("setTemp") === "1";

  try {
    const raw = await req.json();

    // 1) Tolerancia: si viene PLANO, lo convierto a { user, legajo }
    const normalized = "user" in raw ? raw : {
      user: {
        userId: raw.userId,
        email: raw.email,
        nombre: raw.nombre,
        apellido: raw.apellido,
        rolId: raw.rolId,
        fechaNacimiento: raw.fechaNacimiento ?? null,
        genero: raw.genero ?? null,
        estadoCivil: raw.estadoCivil ?? null,
        nacionalidad: raw.nacionalidad ?? null,
        password: raw.password,
      },
      legajo: (raw.legajo != null ||
               raw.cuil != null ||
               raw.documento != null ||
               raw.fechaIngreso != null ||
               raw.puesto != null ||
               raw.numeroLegajo != null) ? {
        employeeNumber: raw.legajo ? Number(raw.legajo) : (raw.numeroLegajo ?? null),
        documentType: raw.tipoDocumento ?? "DNI",
        documentNumber: raw.documento ?? null,
        cuil: raw.cuil ?? null,
        admissionDate: raw.fechaIngreso ?? null,
        terminationDate: raw.fechaEgreso ?? null,
        employmentStatus: raw.estadoLaboral ?? "ACTIVO",
        contractType: raw.tipoContrato ?? null,
        position: raw.puesto ?? null,
        area: raw.area ?? null,
        department: raw.departamento ?? null,
        category: raw.categoria ?? null,
        notes: raw.observaciones ?? null,
      } : undefined,
    };

    // 2) Validación con Zod mostrando issues si falla
    const parsed = bodySchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { user: userDto, legajo: legajoDto } = parsed.data;

    const emailNorm = normalizeEmail(userDto.email);
    const userIdNorm = userDto.userId?.trim();
    const cuilNorm = normalizeCuil(legajoDto?.cuil);

    // PRIORIDAD de búsqueda: CUIL -> userId -> email
    let targetUser: Awaited<ReturnType<typeof prisma.usuario.findUnique>> | null = null;

    if (cuilNorm) {
      const leg = await prisma.legajo.findUnique({ where: { cuil: cuilNorm }, include: { usuario: true } });
      if (leg?.usuario) targetUser = leg.usuario;
    }
    if (!targetUser && userIdNorm) targetUser = await prisma.usuario.findUnique({ where: { userId: userIdNorm } });
    if (!targetUser && emailNorm) targetUser = await prisma.usuario.findUnique({ where: { email: emailNorm } });

    let tempPassword: string | undefined;

    if (targetUser) {
      // revive + actualiza (sin tocar userId)
      const dataToUpdate: any = { deletedAt: null };
      if (emailNorm) dataToUpdate.email = emailNorm;
      if (userDto.nombre !== undefined) dataToUpdate.nombre = userDto.nombre ?? null;
      if (userDto.apellido !== undefined) dataToUpdate.apellido = userDto.apellido ?? null;
      if (userDto.rolId !== undefined) dataToUpdate.rolId = userDto.rolId;

      // Campos nuevos (si vienen)
      if ("fechaNacimiento" in userDto)
        dataToUpdate.fechaNacimiento = fromYMDorISO(userDto.fechaNacimiento);
      if ("genero" in userDto)
        dataToUpdate.genero = userDto.genero ?? null;
      if ("estadoCivil" in userDto)
        dataToUpdate.estadoCivil = userDto.estadoCivil ?? null;
      if ("nacionalidad" in userDto)
        dataToUpdate.nacionalidad = userDto.nacionalidad ?? null;

      if (setTemp) {
        tempPassword = userDto.password || randomBytes(6).toString("base64url");
        dataToUpdate.password = await hash(tempPassword, 12);
        dataToUpdate.mustChangePassword = true;
      }

      try {
        targetUser = await prisma.usuario.update({ where: { id: targetUser.id }, data: dataToUpdate });
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" && dataToUpdate.email) {
          // email duplicado → reintento sin email
          delete dataToUpdate.email;
          targetUser = await prisma.usuario.update({ where: { id: targetUser.id }, data: dataToUpdate });
        } else {
          throw e;
        }
      }
    } else {
      // Crear nuevo con password temporal (o provista)
      tempPassword = userDto.password || randomBytes(6).toString("base64url");
      const fallbackUserId = userIdNorm || (emailNorm ? emailNorm.split("@")[0] : `u_${Date.now()}`);
      const fallbackEmail  = emailNorm || `${fallbackUserId}@example.com`;

      targetUser = await prisma.usuario.create({
        data: {
          userId: userDto.userId ?? fallbackUserId,
          email: userDto.email ?? fallbackEmail,
          password: await hash(tempPassword, 12),
          mustChangePassword: true, // obliga cambio
          nombre: userDto.nombre ?? null,
          apellido: userDto.apellido ?? null,
          rolId: userDto.rolId ?? 2,
          // Campos nuevos
          fechaNacimiento: fromYMDorISO(userDto.fechaNacimiento),
          genero: userDto.genero ?? null,
          estadoCivil: userDto.estadoCivil ?? null,
          nacionalidad: userDto.nacionalidad ?? null,
        },
      });
    }

    // Upsert legajo si vino
    let savedLegajo: any = null;
    if (legajoDto) {
      const data = {
        usuarioId: targetUser.id,
        numeroLegajo: legajoDto.employeeNumber ?? null,
        tipoDocumento: legajoDto.documentType ?? null,
        documento: legajoDto.documentNumber ?? null,
        cuil: cuilNorm ?? null,
        fechaIngreso: fromYMDorISO(legajoDto.admissionDate),
        fechaEgreso: fromYMDorISO(legajoDto.terminationDate),
        estadoLaboral: legajoDto.employmentStatus ?? "ACTIVO",
        tipoContrato: legajoDto.contractType ?? null,
        puesto: legajoDto.position ?? null,
        area: legajoDto.area ?? null,
        departamento: legajoDto.department ?? null,
        categoria: legajoDto.category ?? null,
        observaciones: legajoDto.notes ?? null,
      };

      try {
        savedLegajo = await prisma.legajo.upsert({
          where: { usuarioId: targetUser.id },
          update: data,
          create: data,
        });
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          return NextResponse.json({ error: "duplicate_legajo" }, { status: 409 });
        }
        throw e;
      }
    }

    // DEVOLVEMOS LA TEMP PASSWORD (sólo aquí)
    return NextResponse.json({
      user: {
        id: targetUser.id,
        userId: targetUser.userId,
        email: targetUser.email,
        nombre: targetUser.nombre,
        apellido: targetUser.apellido,
        rolId: targetUser.rolId,
        mustChangePassword: targetUser.mustChangePassword,
      },
      legajo: savedLegajo ? {
        id: savedLegajo.id,
        admissionDate: savedLegajo.fechaIngreso ? toYMD(savedLegajo.fechaIngreso) : null,
        employeeNumber: savedLegajo.numeroLegajo,
        cuil: savedLegajo.cuil
      } : null,
      tempPassword: tempPassword || undefined,
    });
  } catch (e: any) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "validation_error", issues: e.issues }, { status: 400 });
    }
    console.error("[import-upsert] error:", e?.message || e);
    return NextResponse.json({ error: "bad_request", message: e?.message ?? "Invalid body" }, { status: 400 });
  }
}
