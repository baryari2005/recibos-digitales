import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().min(1).optional(),
}).refine(d => d.email || d.userId, { message: "Debe enviar email o userId" });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, "La nueva clave debe tener al menos 6 caracteres"),
});
