import { z } from "zod";

export const sexSchema = z.enum(["M", "F"]);
export type Sex = z.infer<typeof sexSchema>;
export const SEX_LABELS = {
  M: "Masculino",
  F: "Feminino",
};

export const CLINICAL_STATUS = [
  'eutrofia',
  'sobrepeso',
  'obesidade_nv1',
  'obesidade_nv2',
  'obesidade_nv3',
  'baixo_peso',
] as const;

export const CLINICAL_STATUS_LABELS = {
  eutrofia: "Eutrofia",
  sobrepeso: "Sobrepeso",
  obesidade_nv1: "Obesidade Nível 1",
  obesidade_nv2: "Obesidade Nível 2",
  obesidade_nv3: "Obesidade Nível 3",
  baixo_peso: "Baixo Peso",
}

export const PATIENT_STATUS = [
  "ativo",
  "retorno_pendente",
  "inativo"
] as const;

export const patientStatusSchema = z.enum(PATIENT_STATUS);

export const PATIENT_STATUS_LABELS = {
  ativo: "Ativo",
  retorno_pendente: "Retorno Pendente",
  inativo: "Inativo"
}

export type PatientStatus = (typeof PATIENT_STATUS)[keyof typeof PATIENT_STATUS];

export const patientCreateSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(120),
  cpf: z.string().trim().optional(),
  dataNascimento: z.string().date(),
  sexo: sexSchema,
  contato: z.string().trim().min(1, "Informe o contato.").max(120),
  email: z.string().email("Informe um email válido.").optional(),
  telefone: z.string().max(20).optional(),
  anamnese: z.string().max(10000).optional(),
  status: patientStatusSchema,
});

export const patientUpdateSchema = patientCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    { message: "Informe ao menos um campo para atualizar." }
  );

export type PatientSelect = {
  id: true;
  cpf: true;
  nutricionistaId: true;
  nome: true;
  dataNascimento: true;
  sexo: true;
  contato: true;
  email: true;
  telefone: true;
  anamnese: true;
  arquivadoEm: true;
  status: true;
  criadoEm: true;
  atualizadoEm: true;
};

export type PatientRecord = {
  id: string;
  cpf: string | null;
  nutricionistaId: string;
  nome: string;
  dataNascimento: Date;
  sexo: "M" | "F";
  contato: string;
  email: string | null;
  telefone: string | null;
  anamnese: string | null;
  arquivadoEm: Date | null;
  status: PatientStatus;
  criadoEm: Date;
  atualizadoEm: Date;
};

// no front existe um objeto do tipo { pacientes: PatientPage }
export type PatientPage = {
  items: PatientRecord[];
  total: number;
  page: number;
  pageSize: number
};

export type PatientFilters = {
  q?: string;
  page?: number; // começa em 1
  pageSize?: number; // padrão 50, máximo 100
};


export const patientListQuerySchema = z.object({
  incluirArquivados: z
    .enum(["true", "false"])
    .optional()
    .default("false"),

  q: z
    .string()
    .trim()
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50),
});

export type PatientListQuery = z.infer<typeof patientListQuerySchema>;

export const patientIdSchema = z.string().uuid();

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;