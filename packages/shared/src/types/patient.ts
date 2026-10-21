import { z } from "zod";

export const sexSchema = z.enum(["M", "F"]);

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

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;