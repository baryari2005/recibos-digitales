import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio")
    .email("Email inválido"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;


export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirm: z.string().min(8, "Confirmación requerida"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
