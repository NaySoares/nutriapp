import {
  calculateNutritionalMetrics,
  type MeasurementCreateInput,
  type MeasurementUpdateInput
} from "@nutriapp/shared";
import type { AuthRepository } from "../repositories/authRepository.js";

export function createMeasurementService(repository: AuthRepository) {
  return {
    async list(sessionId: string, patientId: string) {
      const ownerId = await repository.findSessionOwner(sessionId);
      return ownerId ? repository.listMeasurements(ownerId, patientId) : null;
    },
    async create(sessionId: string, patientId: string, input: MeasurementCreateInput) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;
      const patient = await repository.findPatientOwner(ownerId, patientId);
      if (!patient) return undefined;
      const metrics = await calculateMetrics(repository, ownerId, patient, input);
      return repository.createMeasurement(patientId, { ...toMeasurementData(input), ...metrics });
    },
    async update(sessionId: string, measurementId: string, input: MeasurementUpdateInput) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;
      const existing = await repository.findMeasurement(ownerId, measurementId);
      if (!existing) return undefined;
      const patient = await repository.findPatientOwner(ownerId, existing.pacienteId);
      if (!patient) return undefined;
      const values = {
        data: input.data ?? formatDate(existing.data),
        pesoKg: input.pesoKg ?? Number(existing.pesoKg),
        alturaCm: input.alturaCm ?? Number(existing.alturaCm),
        nivelAtividade: input.nivelAtividade ?? existing.nivelAtividade,
        circunferencias: input.circunferencias ?? existing.circunferencias ?? undefined
      } as MeasurementCreateInput;
      const metrics = await calculateMetrics(repository, ownerId, patient, values);
      return repository.updateMeasurement(ownerId, measurementId, { ...toMeasurementData(values), ...metrics });
    },
    async remove(sessionId: string, measurementId: string) {
      const ownerId = await repository.findSessionOwner(sessionId);
      return ownerId ? repository.deleteMeasurement(ownerId, measurementId) : null;
    }
  };
}

async function calculateMetrics(
  repository: AuthRepository,
  nutritionistId: string,
  patient: { dataNascimento: Date; sexo: "M" | "F" },
  input: MeasurementCreateInput
) {
  const settings = await repository.findNutritionistSettings(nutritionistId);
  if (!settings) return undefined;
  const formula = settings.formulaPadrao;
  const factor = settings.fatoresAtividade[input.nivelAtividade];
  if (!factor) throw new Error(`Fator de atividade não configurado: ${input.nivelAtividade}`);
  return calculateNutritionalMetrics({
    pesoKg: input.pesoKg,
    alturaCm: input.alturaCm,
    idade: calculateAge(patient.dataNascimento, input.data),
    sexo: patient.sexo,
    formula,
    fatorAtividade: factor
  });
}

function toMeasurementData(input: MeasurementCreateInput) {
  return {
    data: new Date(`${input.data}T00:00:00.000Z`),
    pesoKg: input.pesoKg,
    alturaCm: input.alturaCm,
    circunferencias: input.circunferencias,
    nivelAtividade: input.nivelAtividade
  };
}

function calculateAge(birthDate: Date, measurementDate: string): number {
  const birth = new Date(birthDate);
  const date = new Date(`${measurementDate}T00:00:00.000Z`);
  let age = date.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = date.getUTCMonth() < birth.getUTCMonth()
    || (date.getUTCMonth() === birth.getUTCMonth() && date.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type MeasurementService = ReturnType<typeof createMeasurementService>;
