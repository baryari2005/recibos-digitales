import { z } from "zod";
import {
  EstadoCivil,
  Genero,
  Nacionalidad,
  TipoDocumento,
} from "@prisma/client";

export const patchUserSchema = z.object({
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

  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado yyyy-MM-dd")
    .nullable()
    .optional(),
  genero: z.nativeEnum(Genero).nullable().optional(),
  estadoCivil: z.nativeEnum(EstadoCivil).nullable().optional(),
  nacionalidad: z.nativeEnum(Nacionalidad).nullable().optional(),
});

export type PatchUserDto = z.infer<typeof patchUserSchema>;