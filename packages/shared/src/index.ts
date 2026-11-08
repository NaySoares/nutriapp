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
  TmbFormula
} from "./nutri-calc/index.js";

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// appointment types
export type { CreateAppointmentResult, AppointmentRecord, AppointmentStatus } from "./types/appointments.js";
export { AppointmentCreateInput, AppointmentUpdateInput, AppointmentCreate, AppointmentUpdate, appointmentIdSchema, appointmentUpdateSchema } from "./types/appointments.js";
export { LOCAIS, LOCAIS_LABELS, ATENDIMENTOS, ATENDIMENTOS_LABELS, TIPOS_CONSULTA, TIPOS_CONSULTA_LABELS, STATUS_AGENDAMENTO, STATUS_AGENDAMENTO_LABELS, DURATION_APPOINTMENT, DURATION_APPOINTMENT_LABELS } from "./types/appointments.js";

// patient types
export type { Sex, PatientPage, PatientFilters, PatientCreateInput, PatientUpdateInput, PatientSelect, PatientRecord, PatientListQuery, PatientStatus } from "./types/patient.js";
export { patientIdSchema, patientUpdateSchema, patientCreateSchema, patientListQuerySchema, sexSchema } from "./types/patient.js";
export { SEX_LABELS, PATIENT_STATUS, PATIENT_STATUS_LABELS } from "./types/patient.js";

// food types
export type { FoodRecord, FoodCreateInput, FoodUpdateInput } from "./types/food.js";
export { foodIdSchema, foodUpdateSchema, foodCreateSchema, FOOD_CATEGORIES } from "./types/food.js";

// meal types
export type { MealCreate, MealUpdate, ItemMealCreate, ItemMealUpdate, MealIdSchema, TypeMeal, MealPage, ItemsMealRecord, MealListData } from "./types/meal.js";
export { TYPE_MEAL, TYPE_MEAL_LABELS, ItemMealCreateSchema, ItemMealUpdateSchema, MealCreateSchema, MealUpdateSchema, mealIdSchema, CreateMealResult, ListMealResult, UpdateMealResult, DeleteMealResult, MealRecord } from "./types/meal.js";