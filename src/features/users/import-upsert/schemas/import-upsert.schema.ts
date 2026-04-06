import { EstadoCivil, Genero, Nacionalidad, TipoDocumento } from "@prisma/client";
import { z } from "zod";

export const importUpsertBodySchema = z.object({
  user: z.object({
    userId: z.string().trim().optional(),
    email: z.string().email().optional(),

    nombre: z.string().optional().nullable(),
    apellido: z.string().optional().nullable(),

    rolId: z.number().int().positive().optional(),

    fechaNacimiento: z.string().optional().nullable(),

    genero: z.nativeEnum(Genero).optional().nullable(),
    estadoCivil: z.nativeEnum(EstadoCivil).optional().nullable(),
    nacionalidad: z.nativeEnum(Nacionalidad).optional().nullable(),

    documentType: z.nativeEnum(TipoDocumento).optional().nullable(),
    documentNumber: z.string().optional().nullable(),
    cuil: z.string().optional().nullable(),

    celular: z.string().optional().nullable(),
    domicilio: z.string().optional().nullable(),
    codigoPostal: z.string().optional().nullable(),

    password: z.string().optional(),
  }),

  legajo: z
    .object({
      employeeNumber: z.number().int().positive().optional().nullable(),
      admissionDate: z.string().optional().nullable(),
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
      matriculaProvincial: z.string().optional().nullable(),
      matriculaNacional: z.string().optional().nullable(),
    })
    .optional(),
});

export type ImportUpsertBodyDto = z.infer<typeof importUpsertBodySchema>;