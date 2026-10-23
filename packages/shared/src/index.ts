import { z } from "zod";

export const formulaSchema = z.enum(["mifflin", "harris_benedict"]);
export const activityLevelSchema = z.enum([
  "sedentario",
  "leve",
  "moderado",
  "ativo",
  "muito_ativo"
]);

export const healthResponseSchema = z.object({ status: z.literal("ok"), service: z.literal("api") });

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



export const measurementCreateSchema = z.object({
  data: z.string().date(),
  pesoKg: z.number().min(2).max(500),
  alturaCm: z.number().min(50).max(250),
  circunferencias: z.record(z.number().positive()).optional(),
  nivelAtividade: activityLevelSchema
});

export const measurementUpdateSchema = measurementCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Informe ao menos um campo para atualizar." }
);

export const measurementIdSchema = z.string().uuid();

export const settingsSchema = z.object({
  formulaPadrao: formulaSchema,
  fatoresAtividade: z.object({
    sedentario: z.number().positive(),
    leve: z.number().positive(),
    moderado: z.number().positive(),
    ativo: z.number().positive(),
    muito_ativo: z.number().positive()
  })
});

export type User = {
  id: string;
  nome: string;
  email: string;
  role: string;
  crn: string | null;
  avatarUrl?: string | null;
  logoPath: string | null
};

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MeasurementCreateInput = z.infer<typeof measurementCreateSchema>;
export type MeasurementUpdateInput = z.infer<typeof measurementUpdateSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

export {
  DEFAULT_ACTIVITY_FACTORS,
  calculateGet,
  calculateImc,
  calculateNutritionalMetrics,
  calculateTmb
} from "./nutri-calc/index.js";
export type {
  GetInput,
  NutriCalcInput,
  NutritionalMetrics,
  Sex,
  TmbFormula
} from "./nutri-calc/index.js";

// appointment types
export type { AppointmentRecord, AppointmentStatus } from "./types/appointments.js";
export { AppointmentCreateInput, AppointmentUpdateInput, AppointmentCreate, AppointmentUpdate, appointmentIdSchema, appointmentUpdateSchema } from "./types/appointments.js";
export { LOCAIS, ATENDIMENTOS, TIPOS_CONSULTA, STATUS_AGENDAMENTO } from "./types/appointments.js";

// patient types
export type { PatientCreateInput, PatientUpdateInput, PatientSelect, PatientRecord } from "./types/patient.js";
export { patientIdSchema, patientUpdateSchema, patientCreateSchema } from "./types/patient.js";

// food types
export type { FoodRecord, FoodCreateInput, FoodUpdateInput } from "./types/food.js";
export { foodIdSchema, foodUpdateSchema, foodCreateSchema } from "./types/food.js";
