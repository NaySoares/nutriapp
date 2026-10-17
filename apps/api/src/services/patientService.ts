import type { AuthRepository } from "../repositories/authRepository.js";
import type { PatientCreateInput, PatientUpdateInput } from "@nutriapp/shared";

export function createPatientService(repository: AuthRepository) {
  return {
    async list(sessionId: string, search?: string, includeArchived = false) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      return nutritionistId ? repository.listPatients(nutritionistId, search, includeArchived) : null;
    },
    async create(sessionId: string, input: PatientCreateInput) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return repository.createPatient(nutritionistId, toCreateData(input));
    },
    async get(sessionId: string, patientId: string) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      return nutritionistId ? repository.findPatient(nutritionistId, patientId) : null;
    },
    async update(sessionId: string, patientId: string, input: PatientUpdateInput) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      const updated = await repository.updatePatient(nutritionistId, patientId, toUpdateData(input));
      return updated ? repository.findPatient(nutritionistId, patientId) : undefined;
    },
    async archive(sessionId: string, patientId: string) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return (await repository.archivePatient(nutritionistId, patientId)) || undefined;
    }
  };
}

function toCreateData(input: PatientCreateInput) {
  return {
    ...input,
    dataNascimento: new Date(`${input.dataNascimento}T00:00:00.000Z`)
  };
}

function toUpdateData(input: PatientUpdateInput) {
  const { dataNascimento, ...rest } = input;
  const data: {
    nome?: string;
    dataNascimento?: Date;
    sexo?: "M" | "F";
    contato?: string | null;
    anamnese?: string | null;
  } = rest;
  if (dataNascimento) data.dataNascimento = new Date(`${dataNascimento}T00:00:00.000Z`);
  return data;
}

export type PatientService = ReturnType<typeof createPatientService>;
