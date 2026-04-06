import { z } from "zod";
import { TIPOS_DOCUMENTO_OPCIONES } from "@/constants/tiposDocumento";
import { GENERO_OPCIONES } from "@/constants/genero";
import { ESTADO_CIVIL_OPCIONES } from "@/constants/estadocivil";
import { NACIONALIDAD_VALUES } from "@/constants/nacionalidad";

const onlyDigits = (s: string) => s.replace(/\D+/g, "");

const titleCaseEs = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /([a-záéíóúüñ]+)([a-záéíóúüñ'-]*)/gi,
      (_m, p1: string, p2: string) =>
        p1.charAt(0).toUpperCase() + p1.slice(1) + p2
    );

const isValidDni = (v?: string) => {
  if (v == null || v === "") return true;
  const d = onlyDigits(v);
  return d.length >= 7 && d.length <= 8;
};

const CUIL_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

const isValidCuil = (v?: string) => {
  if (v == null || v === "") return true;
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
  if (!dc || !dd) return true;
  if (dc.length !== 11) return true;
  return dc.slice(2, 10) === dd;
};

const isValidPhone = (v?: string) => {
  if (v == null || v === "") return true;
  const ds = onlyDigits(v);
  return ds.length >= 8 && ds.length <= 15;
};

const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado yyyy-MM-dd");

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
    .refine((v) => v === "" || isValidDni(v), {
      message: "DNI inválido",
    })
    .optional(),
  cuil: z
    .string()
    .refine((v) => v === "" || isValidCuil(v), {
      message: "CUIL inválido",
    })
    .optional(),
  celular: z
    .string()
    .refine((v) => v === "" || isValidPhone(v), {
      message: "Celular inválido",
    })
    .optional(),
  domicilio: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .transform((v) => titleCaseEs(v))
    .optional(),
  codigoPostal: z.string().max(20, "Máximo 20 caracteres").optional(),
  fechaNacimiento: ymd.nullable().optional(),
  genero: z.enum(GENERO_OPCIONES).optional(),
  estadoCivil: z.enum(ESTADO_CIVIL_OPCIONES).optional(),
  nacionalidad: z.enum(NACIONALIDAD_VALUES).optional(),
});

const createUserSchemaBase = BaseFields.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const editUserSchemaBase = BaseFields.extend({
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 0 || v.length >= 6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
});

function applyCrossChecks<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((val, ctx) => {
    const value = val as z.infer<typeof BaseFields> & { password?: string };

    if (
      value.cuil &&
      value.cuil !== "" &&
      value.documento &&
      value.documento !== "" &&
      !cuilMatchesDni(value.cuil, value.documento)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cuil"],
        message: "El CUIL no coincide con el DNI",
      });
    }
  });
}

export const createUserSchema = applyCrossChecks(createUserSchemaBase);
export const editUserSchema = applyCrossChecks(editUserSchemaBase);

export type CreateUserSchemaValues = z.infer<typeof createUserSchema>;
export type EditUserSchemaValues = z.infer<typeof editUserSchema>;
export type UserSchemaValues = z.infer<typeof BaseFields> & {
  password?: string;
};

export const userSchemaHelpers = {
  titleCaseEs,
  onlyDigits,
  isValidDni,
  isValidCuil,
  cuilMatchesDni,
  isValidPhone,
};