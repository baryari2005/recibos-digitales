// src/app/api/users/import-upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { EstadoCivil, Genero, Nacionalidad, Prisma, TipoDocumento } from "@prisma/client";
import { z, ZodError } from "zod";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ======================== Zod schemas ======================== */
const bodySchema = z.object({
  user: z.object({
    userId: z.string().trim().optional(),
    email: z.string().email().optional(),

    // Nombre / apellido llegan libres → los normalizamos
    nombre: z.string().optional().nullable(),
    apellido: z.string().optional().nullable(),

    // No usamos rolId del body (siempre 1), pero lo toleramos
    rolId: z.number().int().positive().optional(),

    // "YYYY-MM-DD" o ISO
    fechaNacimiento: z.string().optional().nullable(),

    genero: z.nativeEnum(Genero).optional().nullable(),
    estadoCivil: z.nativeEnum(EstadoCivil).optional().nullable(),
    nacionalidad: z.nativeEnum(Nacionalidad).optional().nullable(),

    // Doc/CUIL van en Usuario (no Legajo)
    documentType: z.nativeEnum(TipoDocumento).optional().nullable(),
    documentNumber: z.string().optional().nullable(),
    cuil: z.string().optional().nullable(),

    // Extras a cargar
    celular: z.string().optional().nullable(),
    domicilio: z.string().optional().nullable(),
    codigoPostal: z.string().optional().nullable(),

    // Si llega, la usamos. Si no, generamos temp.
    password: z.string().optional(),
  }),

  legajo: z
    .object({
      employeeNumber: z.number().int().positive().optional().nullable(),
      admissionDate: z.string().optional().nullable(), // YYYY-MM-DD o ISO
      terminationDate: z.string().optional().nullable(),
      employmentStatus: z.enum(["ACTIVO", "SUSPENDIDO", "LICENCIA", "BAJA"]).optional(),
      contractType: z
        .enum(["INDETERMINADO", "PLAZO_FIJO", "TEMPORAL", "PASANTIA", "MONOTRIBUTO"])
        .optional()
        .nullable(),
      position: z.string().optional().nullable(),
      area: z.string().optional().nullable(),
      department: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),

      // Matrículas en Legajo
      matriculaProvincial: z.string().optional().nullable(),
      matriculaNacional: z.string().optional().nullable(),
    })
    .optional(),
});

/* ======================== Helpers ======================== */

const normalizeEmail = (e?: string | null) => (e ?? "").trim().toLowerCase() || undefined;

// Sólo dígitos (para comparar/buscar)
const cuilDigits = (v?: string | null) => (v ?? "").replace(/\D+/g, "") || undefined;

// XX-XXXXXXXX-X (si tiene 11 dígitos)
const formatCuil = (v?: string | null): string | null => {
  const d = (v ?? "").replace(/\D+/g, "");
  if (d.length !== 11) return (v ?? null) ? String(v) : null;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
};

/** YYYY-MM-DD desde Date (UTC) */
const toYMD = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;

/** Acepta "YYYY-MM-DD" o ISO y devuelve Date UTC o null */
const fromYMDorISO = (s?: string | null): Date | null => {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const d = new Date(`${t}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
};

// TitleCase para nombres: "mAbel aLiCia doMinguez" → "Mabel Alicia Dominguez"
const titleCase = (raw?: string | null): string | null => {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  const cap = (w: string) =>
    w
      .split("-")
      .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
      .join("-");
  return s
    .split(/\s+/)
    .map(cap)
    .join(" ");
};

// Normaliza matrículas y asegura prefijo MP/MN una sola vez
const ensureMatriculaPrefix = (raw?: string | null, prefix: "MP" | "MN" = "MP"): string | null => {
  if (!raw) return null;
  const up = String(raw).toUpperCase().trim();
  if (!up) return null;
  // Remuevo prefijos similares: M.P., MP-, MP/, etc.
  const letters = prefix.split("").join("[\\s.\\-\\/]*"); // M\s*P
  const re = new RegExp(`^${letters}[\\s.\\-\\/]*`, "i");
  const rest = up.replace(re, "").trim();
  return rest ? `${prefix} ${rest}` : prefix; // si sólo venía "mp", queda "MP"
};

/** Convierte un body plano a { user, legajo } */
function normalizeRawBody(raw: any) {
  if (raw && typeof raw === "object" && "user" in raw) return raw;

  return {
    user: {
      userId: raw?.userId,
      email: raw?.email,
      nombre: raw?.nombre,
      apellido: raw?.apellido,

      fechaNacimiento: raw?.fechaNacimiento ?? null,
      genero: raw?.genero ?? null,
      estadoCivil: raw?.estadoCivil ?? null,
      nacionalidad: raw?.nacionalidad ?? null,

      // Doc/CUIL aquí
      documentType: raw?.tipoDocumento ?? null,
      documentNumber: raw?.documento ?? null,
      cuil: raw?.cuil ?? null,

      // Extras
      celular: raw?.celular ?? null,
      domicilio: raw?.domicilio ?? null,
      codigoPostal: raw?.codigoPostal ?? null,

      password: raw?.password,
    },

    legajo:
      raw?.legajo != null ||
      raw?.numeroLegajo != null ||
      raw?.fechaIngreso != null ||
      raw?.fechaEgreso != null ||
      raw?.puesto != null ||
      raw?.matriculaProvincial != null ||
      raw?.matriculaNacional != null ||
      raw?.estadoLaboral != null ||
      raw?.tipoContrato != null
        ? {
            employeeNumber: raw?.legajo ? Number(raw.legajo) : raw?.numeroLegajo ?? null,
            admissionDate: raw?.fechaIngreso ?? null,
            terminationDate: raw?.fechaEgreso ?? null,
            employmentStatus: raw?.estadoLaboral ?? "ACTIVO",
            contractType: raw?.tipoContrato ?? null,
            position: raw?.puesto ?? null,
            area: raw?.area ?? null,
            department: raw?.departamento ?? null,
            category: raw?.categoria ?? null,
            notes: raw?.observaciones ?? null,

            matriculaProvincial: raw?.matriculaProvincial ?? null,
            matriculaNacional: raw?.matriculaNacional ?? null,
          }
        : undefined,
  };
}

/* ======================== Handler ======================== */

/**
 * POST /api/users/import-upsert?setTemp=1
 * - Crea o actualiza Usuario (prioridad de búsqueda: CUIL → userId → email)
 * - Upsert de Legajo si viene
 * - Devuelve tempPassword cuando corresponde
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const setTemp = url.searchParams.get("setTemp") === "1";

  try {
    const raw = await req.json();
    const normalized = normalizeRawBody(raw);

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

    // CUIL: buscamos tolerando ambas variantes y guardamos formateado con guiones
    const cuilNum = cuilDigits(userDto.cuil);                 // ej: 27114201613
    const cuilFmt = formatCuil(userDto.cuil);                 // ej: 27-11420161-3

    // 1) Buscar targetUser por CUIL (numérico o formateado) -> userId -> email
    let targetUser:
      | (Prisma.PromiseReturnType<typeof prisma.usuario.findFirst> & { id: string })
      | null = null;

    if (cuilNum) {
      targetUser = await prisma.usuario.findFirst({
        where: { OR: [{ cuil: cuilNum }, { cuil: cuilFmt ?? "" }] },
      });
    }
    if (!targetUser && userIdNorm) {
      targetUser = await prisma.usuario.findFirst({ where: { userId: userIdNorm } });
    }
    if (!targetUser && emailNorm) {
      targetUser = await prisma.usuario.findFirst({ where: { email: emailNorm } });
    }

    let tempPassword: string | undefined;

    if (targetUser) {
      // 2) UPDATE Usuario (revive si estaba borrado, fuerza rolId=1)
      const dataToUpdate: Prisma.UsuarioUncheckedUpdateInput = {
        deletedAt: null,
        rolId: 1, // SIEMPRE rol 1
      };

      if (emailNorm) dataToUpdate.email = emailNorm;

      // Nombre / Apellido en TitleCase
      if (userDto.nombre !== undefined) dataToUpdate.nombre = titleCase(userDto.nombre);
      if (userDto.apellido !== undefined) dataToUpdate.apellido = titleCase(userDto.apellido);

      // Extras personales
      if ("fechaNacimiento" in userDto)
        dataToUpdate.fechaNacimiento = fromYMDorISO(userDto.fechaNacimiento);
      if ("genero" in userDto) dataToUpdate.genero = userDto.genero ?? null;
      if ("estadoCivil" in userDto) dataToUpdate.estadoCivil = userDto.estadoCivil ?? null;
      if ("nacionalidad" in userDto) dataToUpdate.nacionalidad = userDto.nacionalidad ?? null;

      // Contacto
      if ("celular" in userDto) dataToUpdate.celular = userDto.celular ?? null;
      if ("domicilio" in userDto) dataToUpdate.domicilio = userDto.domicilio ?? null;
      if ("codigoPostal" in userDto) dataToUpdate.codigoPostal = userDto.codigoPostal ?? null;

      // Doc/CUIL (guardamos CUIL con guiones)
      if ("documentType" in userDto) dataToUpdate.tipoDocumento = userDto.documentType ?? null;
      if ("documentNumber" in userDto) dataToUpdate.documento = userDto.documentNumber ?? null;
      if ("cuil" in userDto) dataToUpdate.cuil = cuilFmt ?? cuilNum ?? null;

      if (setTemp) {
        tempPassword = userDto.password || randomBytes(6).toString("base64url");
        dataToUpdate.password = await hash(tempPassword, 12);
        dataToUpdate.mustChangePassword = true;
      }

      try {
        targetUser = await prisma.usuario.update({
          where: { id: targetUser.id },
          data: dataToUpdate,
        });
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" && dataToUpdate.email) {
          // Email duplicado → reintentar sin email
          const { email, ...rest } = dataToUpdate;
          targetUser = await prisma.usuario.update({ where: { id: targetUser.id }, data: rest });
        } else {
          throw e;
        }
      }
    } else {
      // 3) CREATE Usuario (rolId=1)
      tempPassword = userDto.password || randomBytes(6).toString("base64url");
      const fallbackUserId = userIdNorm || (emailNorm ? emailNorm.split("@")[0] : `u_${Date.now()}`);
      const fallbackEmail = emailNorm || `${fallbackUserId}@example.com`;

      targetUser = await prisma.usuario.create({
        data: {
          userId: userDto.userId ?? fallbackUserId,
          email: userDto.email ?? fallbackEmail,
          password: await hash(tempPassword, 12),
          mustChangePassword: true,

          nombre: titleCase(userDto.nombre),
          apellido: titleCase(userDto.apellido),

          rolId: 1, // SIEMPRE rol 1

          // extras
          fechaNacimiento: fromYMDorISO(userDto.fechaNacimiento),
          genero: userDto.genero ?? null,
          estadoCivil: userDto.estadoCivil ?? null,
          nacionalidad: userDto.nacionalidad ?? null,

          // contacto
          celular: userDto.celular ?? null,
          domicilio: userDto.domicilio ?? null,
          codigoPostal: userDto.codigoPostal ?? null,

          // Doc/CUIL (guardamos CUIL con guiones)
          tipoDocumento: userDto.documentType ?? null,
          documento: userDto.documentNumber ?? null,
          cuil: cuilFmt ?? cuilNum ?? null,
        },
      });
    }

    // 4) Upsert Legajo (si vino)
    let savedLegajo: any = null;

    if (legajoDto) {
      const data: Prisma.LegajoUncheckedCreateInput = {
        usuarioId: targetUser.id,
        numeroLegajo: legajoDto.employeeNumber ?? null,
        fechaIngreso: fromYMDorISO(legajoDto.admissionDate),
        fechaEgreso: fromYMDorISO(legajoDto.terminationDate),
        estadoLaboral: (legajoDto.employmentStatus as any) ?? "ACTIVO",
        tipoContrato: (legajoDto.contractType as any) ?? null,
        puesto: legajoDto.position ?? null,
        area: legajoDto.area ?? null,
        departamento: legajoDto.department ?? null,
        categoria: legajoDto.category ?? null,
        observaciones: legajoDto.notes ?? null,

        // Matrículas (aseguramos prefijo)
        matriculaProvincial: ensureMatriculaPrefix(legajoDto.matriculaProvincial, "MP"),
        matriculaNacional: ensureMatriculaPrefix(legajoDto.matriculaNacional, "MN"),
      };

      try {
        savedLegajo = await prisma.legajo.upsert({
          where: { usuarioId: targetUser.id },
          update: data,
          create: data,
        });
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          // Conflicto con unique (ej: numeroLegajo duplicado)
          return NextResponse.json({ error: "duplicate_legajo" }, { status: 409 });
        }
        throw e;
      }
    }

    // 5) Respuesta: usuario + legajo (breve) + tempPassword si corresponde
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
      legajo: savedLegajo
        ? {
            id: savedLegajo.id,
            employeeNumber: savedLegajo.numeroLegajo,
            admissionDate: savedLegajo.fechaIngreso ? toYMD(savedLegajo.fechaIngreso) : null,
            terminationDate: savedLegajo.fechaEgreso ? toYMD(savedLegajo.fechaEgreso) : null,
            estadoLaboral: savedLegajo.estadoLaboral,
            tipoContrato: savedLegajo.tipoContrato,
            matriculaProvincial: savedLegajo.matriculaProvincial ?? null,
            matriculaNacional: savedLegajo.matriculaNacional ?? null,
          }
        : null,
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
