// next/src/lib/validations/legajo.schema.ts
import { z } from "zod";

export const legajoSchema = z.object({
  employeeNumber: z.number().int().min(1).optional().nullable(),
  documentType: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  cuil: z.string().optional().nullable(),
  admissionDate: z.string().optional().nullable(),
  terminationDate: z.string().optional().nullable(),
  employmentStatus: z.string().min(1, "Employment status is required"),
  contractType: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type LegajoValues = z.infer<typeof legajoSchema>;
