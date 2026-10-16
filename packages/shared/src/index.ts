import { z } from "zod";

export const formulaSchema = z.enum(["mifflin", "harris_benedict"]);
export const sexSchema = z.enum(["M", "F"]);
export const activityLevelSchema = z.enum([
  "sedentario",
  "leve",
  "moderado",
  "ativo",
  "muito_ativo"
]);

export const apiErrorSchema = z.object({
  codigo: z.string(),
  mensagem: z.string(),
  detalhes: z.unknown().optional()
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const API_BASE_URL = "/api";

export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  senha: z.string().min(12).max(128),
  nome: z.string().trim().min(1).max(120)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  senha: z.string().min(1).max(128)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(320)
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  novaSenha: z.string().min(12).max(128)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
