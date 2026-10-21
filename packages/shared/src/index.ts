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

export const patientCreateSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  dataNascimento: z.string().date(),
  sexo: sexSchema,
  contato: z.string().trim().max(120).optional(),
  anamnese: z.string().max(10000).optional()
});

export const patientUpdateSchema = patientCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Informe ao menos um campo para atualizar." }
);

export const patientIdSchema = z.string().uuid();

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

export const ATENDIMENTOS = ["Particular", "Hospitalar"] as const;
export const TIPOS_CONSULTA = [
  "Consulta de retorno",
  "Avaliação nutricional",
  "Acompanhamento",
  "Revisão do plano",
  "Primeira consulta",
] as const;
export const LOCAIS = ["Consultório", "Online", "Hospital"] as const;
export const STATUS_AGENDAMENTO = [
  "Confirmada",
  "Aguardando confirmação",
  "Concluída",
  "Falta",
  "Cancelada",
] as const;

// ---------- Campos ----------
const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
  .refine((value) => {
    // rejeita datas que casam o formato mas não existem (ex.: 2026-02-31)
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Data inválida.");

const horarioSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:mm.");

// ---------- Create ----------
export const appointmentCreateSchema = z.object({
  pacienteId: z.string().uuid().optional(),
  data: dataSchema,
  horario: horarioSchema,
  duracao: z.number().int().positive(),
  atendimento: z.enum(ATENDIMENTOS),
  tipoConsulta: z.enum(TIPOS_CONSULTA),
  local: z.enum(LOCAIS),
  note: z.string().trim().max(500).optional(),
});

export type AppointmentCreate = z.infer<typeof appointmentCreateSchema>;

export const AppointmentCreateInput = z.object({
  pacienteId: z.string().uuid().optional(),
  paciente: z.string().trim().min(1, "Informe o paciente.").max(120),
  data: dataSchema,
  dataNascimento: dataSchema,
  sexo: sexSchema,
  horario: horarioSchema,
  duracao: z.number().int().positive(),
  atendimento: z.enum(ATENDIMENTOS),
  tipoConsulta: z.enum(TIPOS_CONSULTA),
  local: z.enum(LOCAIS),
  note: z.string().trim().max(500).optional(),
  contato: z.string().trim().max(120).optional()
})

// ---------- Update ----------
const appointmentUpdateBase = appointmentCreateSchema.partial().extend({
  status: z.enum(STATUS_AGENDAMENTO).optional(),
});

export type AppointmentUpdate = z.infer<typeof appointmentUpdateBase>;

export const appointmentUpdateSchema: z.ZodType<AppointmentUpdate> =
  appointmentUpdateBase.refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: "Informe ao menos um campo para atualizar." }
  );

export const appointmentIdSchema = z.string().uuid();

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
export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
export type MeasurementCreateInput = z.infer<typeof measurementCreateSchema>;
export type MeasurementUpdateInput = z.infer<typeof measurementUpdateSchema>;
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateInput>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
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