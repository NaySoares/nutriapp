import type { PatientCreateInput, PatientUpdateInput } from "@nutriapp/shared";
import { SessionRepository } from "../repositories/sessionRepository.js";
import { PatientRepository } from "../repositories/patientRepository.js";

type PatientServiceDependencies = {
  sessions: SessionRepository;
  patients: PatientRepository;
};

export function createPatientService({ sessions, patients }: PatientServiceDependencies) {
  return {
    async list(sessionId: string, search?: string, includeArchived = false) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      return nutritionistId ? patients.listPatients(nutritionistId, search, includeArchived) : null;
    },
    async create(sessionId: string, input: PatientCreateInput) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return patients.createPatient(nutritionistId, toCreateData(input));
    },
    async get(sessionId: string, patientId: string) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      return nutritionistId ? patients.findPatient(nutritionistId, patientId) : null;
    },
    async update(sessionId: string, patientId: string, input: PatientUpdateInput) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      const updated = await patients.updatePatient(nutritionistId, patientId, toUpdateData(input));
      return updated ? patients.findPatient(nutritionistId, patientId) : undefined;
    },
    async archive(sessionId: string, patientId: string) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return (await patients.archivePatient(nutritionistId, patientId)) || undefined;
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
