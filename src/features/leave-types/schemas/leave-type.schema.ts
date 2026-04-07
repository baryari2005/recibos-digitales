import { z } from "zod";

const colorHexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const leaveTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "El código es obligatorio.")
    .max(50, "El código no puede superar los 50 caracteres."),
  label: z
    .string()
    .trim()
    .min(1, "La etiqueta es obligatoria.")
    .max(100, "La etiqueta no puede superar los 100 caracteres."),
  colorHex: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || colorHexRegex.test(value), {
      message: "El color debe ser un HEX válido. Ej: #22c55e",
    }),
  isActive: z.boolean().default(true),
});

export const leaveTypeUpdateSchema = leaveTypeSchema.partial();

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
export type LeaveTypeUpdateValues = z.infer<typeof leaveTypeUpdateSchema>;