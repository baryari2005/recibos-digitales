import { z } from "zod";
import {
  EstadoCivil,
  Genero,
  Nacionalidad,
  TipoDocumento,
} from "@prisma/client";

export const createUserSchema = z.object({
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

export type CreateUserDto = z.infer<typeof createUserSchema>;