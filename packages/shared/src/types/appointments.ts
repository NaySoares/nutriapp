import { z } from "zod";

// duplicado por causa da circular dependency entre appointments.ts e index.ts
export const sexSchema = z.enum(["M", "F"]);
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

export type AppointmentStatus = (typeof STATUS_AGENDAMENTO)[number];

export type AppointmentRecord = {
  id: string;
  nutricionistaId: string;
  pacienteId: string;
  pacienteNome: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  duracao: number; // minutos
  atendimento: AppointmentCreate["atendimento"];
  tipoConsulta: AppointmentCreate["tipoConsulta"];
  local: AppointmentCreate["local"];
  note: string | null;
  status: AppointmentStatus;
  criadoEm: Date;
  atualizadoEm: Date;
};

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
  pacienteNome: z.string().trim().min(1, "Informe o paciente.").max(120),
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


export type AppointmentCreateInput = z.infer<typeof AppointmentCreateInput>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;