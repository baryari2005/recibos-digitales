import { z } from "zod";

export const loginSchema = z.object({
  userId: z.string().min(1, "Ingrese su usuario"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});