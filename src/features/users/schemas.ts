// src/features/users/schemas.ts
import { z } from "zod";
import { TIPOS_DOCUMENTO_OPCIONES } from "@/constants/tiposDocumento";
import { GENERO_OPCIONES } from "@/constants/genero";
import { ESTADO_CIVIL_OPCIONES } from "@/constants/estadocivil";
import { NACIONALIDAD_VALUES } from "@/constants/nacionalidad";

/* ----------------- Helpers ----------------- */
const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const titleCaseEs = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /([a-záéíóúüñ]+)([a-záéíóúüñ'-]*)/gi,
      (_m, p1: string, p2: string) => p1.charAt(0).toUpperCase() + p1.slice(1) + p2
    );

const isValidDni = (v?: string) => {
  if (v == null || v === "") return true; // opcional
  const d = onlyDigits(v);
  return d.length >= 7 && d.length <= 8;
};

const CUIL_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const isValidCuil = (v?: string) => {
  if (v == null || v === "") return true; // opcional
  const ds = onlyDigits(v);
  if (ds.length !== 11) return false;
  const nums = ds.split("").map((d) => parseInt(d, 10));
  const check = nums[10];
  const sum = CUIL_WEIGHTS.reduce((acc, w, i) => acc + w * nums[i], 0);
  let dv = 11 - (sum % 11);
  if (dv === 11) dv = 0;
  else if (dv === 10) dv = 9;
  return dv === check;
};

const cuilMatchesDni = (cuil?: string, dni?: string) => {
  const dc = onlyDigits(cuil || "");
  const dd = onlyDigits(dni || "");
  if (!dc || !dd) return true; // si falta uno, no validar coincidencia
  if (dc.length !== 11) return true;
  return dc.slice(2, 10) === dd;
};

const isValidPhone = (v?: string) => {
  if (v == null || v === "") return true; // opcional
  const ds = onlyDigits(v);
  return ds.length >= 8 && ds.length <= 15;
};

/* ------------- Campos base (SIN superRefine) ------------- */
const BaseFields = z.object({
  userId: z.string().min(1, "Usuario requerido"),
  email: z.string().email("Email inválido"),
  rolId: z.coerce.number().int().positive("Rol inválido"),

  nombre: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .transform((v) => titleCaseEs(v))
    .optional(),
  apellido: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .transform((v) => titleCaseEs(v))
    .optional(),
  avatarUrl: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().url().optional()
  ),

  tipoDocumento: z.enum(TIPOS_DOCUMENTO_OPCIONES).optional(),
  documento: z
    .string()
    .refine((v) => v === "" || isValidDni(v), { message: "DNI inválido" })
    .optional(),
  cuil: z
    .string()
    .refine((v) => v === "" || isValidCuil(v), { message: "CUIL inválido" })
    .optional(),

  celular: z
    .string()
    .refine((v) => v === "" || isValidPhone(v), { message: "Celular inválido" })
    .optional(),
  domicilio: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .transform((v) => titleCaseEs(v))
    .optional(),
  codigoPostal: z.string().max(20, "Máximo 20 caracteres").optional(),

  fechaNacimiento: z.date().nullable().optional(),
  genero: z.enum(GENERO_OPCIONES).optional(),
  estadoCivil: z.enum(ESTADO_CIVIL_OPCIONES).optional(),
  nacionalidad: z.enum(NACIONALIDAD_VALUES).optional(),
});

/* ----- cross-field checks (sin romper extend) ----- */
const withCrossChecks = <T extends z.ZodTypeAny>(schema: T) =>
  (schema as any).superRefine((val: z.infer<typeof BaseFields>, ctx: z.RefinementCtx) => {
    // CUIL ↔ DNI
    if (val.cuil && val.cuil !== "" && val.documento && val.documento !== "") {
      if (!cuilMatchesDni(val.cuil, val.documento)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cuil"],
          message: "El CUIL no coincide con el DNI",
        });
      }
    }
  }) as T;

/* ----------------- Create / Edit ----------------- */
export const createUserSchema = withCrossChecks(
  BaseFields.extend({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
);

export const editUserSchema = withCrossChecks(
  BaseFields.extend({
    password: z
      .string()
      .optional()
      .refine((v) => !v || v.length === 0 || v.length >= 6, {
        message: "La contraseña debe tener al menos 6 caracteres",
      }),
  })
);

/* (Opcional) exportar helpers para usar en UI */
export const userSchemaHelpers = {
  titleCaseEs,
  onlyDigits,
  isValidDni,
  isValidCuil,
  cuilMatchesDni,
  isValidPhone,
};
