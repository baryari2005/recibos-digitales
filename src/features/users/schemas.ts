// src/features/users/schemas.ts
import { z } from "zod";
import { Genero, EstadoCivil } from "@prisma/client";
// Si NO los exporta tu client, usá arrays:
const GENERO_OPCIONES = ["MASCULINO","FEMENINO","NO_BINARIO","OTRO","PREFIERO_NO_DECIR"] as const;
const ESTADO_CIVIL_OPCIONES = ["SOLTERO","CASADO","DIVORCIADO","VIUDO","UNIDO"] as const;

const comunes = {
  fechaNacimiento: z.coerce.date().nullable().optional(),
  genero: z.nativeEnum(Genero).nullable().optional(),
  estadoCivil: z.nativeEnum(EstadoCivil).nullable().optional(),
  nacionalidad: z.string().max(100).nullable().optional(),
};


export const baseUserSchema = z.object({
  userId: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  avatarUrl: z.union([z.string().url("URL inválida"), z.literal(""), z.undefined()]).optional(),
  rolId: z.coerce.number().int().positive("Rol requerido"),
  ...comunes
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const editUserSchema = baseUserSchema.extend({
  password: z.string().optional(),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type EditUserValues   = z.infer<typeof editUserSchema>;
