import type { PatientCreateInput, PatientFilters, PatientUpdateInput } from "@nutriapp/shared";
import { SessionRepository } from "../repositories/sessionRepository.js";
import { PatientRepository } from "../repositories/patientRepository.js";

type PatientServiceDependencies = {
  sessions: SessionRepository;
  patients: PatientRepository;
};

export function createPatientService({ sessions, patients }: PatientServiceDependencies) {
  return {
    async list(sessionId: string, includeArchived = false, filters: PatientFilters) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;

      return patients.listPatients(nutritionistId, includeArchived, filters);
    },

    async create(sessionId: string, input: PatientCreateInput) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return patients.createPatient(nutritionistId, input);
    },

    async get(sessionId: string, patientId: string) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      return nutritionistId ? patients.findPatient(nutritionistId, patientId) : null;
    },

    async update(sessionId: string, patientId: string, input: PatientUpdateInput) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      const updated = await patients.updatePatient(nutritionistId, patientId, input);
      return updated ? patients.findPatient(nutritionistId, patientId) : undefined;
    },

    async archive(sessionId: string, patientId: string) {
      const nutritionistId = await sessions.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return (await patients.archivePatient(nutritionistId, patientId)) || undefined;
    }
  };
}

export type PatientService = ReturnType<typeof createPatientService>;
