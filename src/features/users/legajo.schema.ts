// legajo.schema.ts
import { z } from "zod";

export const EMPLOYMENT_STATUS = ["ACTIVO", "SUSPENDIDO", "LICENCIA", "BAJA"] as const;
export const CONTRACT_TYPES = ["INDETERMINADO", "PLAZO_FIJO", "TEMPORAL", "PASANTIA", "MONOTRIBUTO"] as const;

const toNullIfEmpty = (v: unknown) => (v === "" || v === null || v === undefined ? null : v);
const toTrimmedStringOrNull = (v: unknown) => {
  const nv = toNullIfEmpty(v);
  return nv === null ? null : String(nv).trim();
};

// ⚠️ Clave: .nullish() afuera del preprocess
const optTrimmed = (max = 120) =>
  z.preprocess(toTrimmedStringOrNull, z.string().max(max)).nullish();

const MATRICULA_RE = /^[A-Z0-9 .\-\/]+$/i;
const matriculaSchema =
  z.preprocess(toTrimmedStringOrNull, z.string().regex(MATRICULA_RE, "Formato inválido")).nullish();

export const legajoSchema = z.object({
  employeeNumber: z.number().int().positive().nullish(),

  admissionDate: z.string().nullish(),
  terminationDate: z.string().nullish(),

  employmentStatus: z.enum(EMPLOYMENT_STATUS),
  contractType: z.enum(CONTRACT_TYPES).nullish(),

  position: optTrimmed(120),
  area: optTrimmed(120),
  department: optTrimmed(120),
  category: optTrimmed(120),

  matriculaProvincial: matriculaSchema,
  matriculaNacional: matriculaSchema,

  notes: optTrimmed(1000),
});

export type LegajoValues = z.infer<typeof legajoSchema>;
