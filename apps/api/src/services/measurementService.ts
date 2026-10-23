import {
  calculateNutritionalMetrics,
  type MeasurementCreateInput,
  type MeasurementUpdateInput
} from "@nutriapp/shared";
import { SessionRepository } from "../repositories/sessionRepository.js";
import { MeasurementRepository } from "../repositories/measurementRepository.js";
import { PatientRepository } from "../repositories/patientRepository.js";
import { SettingsRepository } from "../repositories/settingsRepository.js";

type MeasurentServiceDependencies = {
  sessions: SessionRepository;
  measurements: MeasurementRepository;
  patients: PatientRepository;
  settings: SettingsRepository;
};

export function createMeasurementService({ sessions, measurements, patients, settings }: MeasurentServiceDependencies) {
  return {
    async list(sessionId: string, patientId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      return ownerId ? measurements.listMeasurements(ownerId, patientId) : null;
    },
    async create(sessionId: string, patientId: string, input: MeasurementCreateInput) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;
      const patient = await patients.findPatientOwner(ownerId, patientId);
      if (!patient) return undefined;
      const nutritionistSettings = await settings.findNutritionistSettings(ownerId);
      if (!nutritionistSettings) return undefined;
      const metrics = calculateMetrics(nutritionistSettings, patient, input);
      return measurements.createMeasurement(patientId, { ...toMeasurementData(input), ...metrics });
    },
    async update(sessionId: string, measurementId: string, input: MeasurementUpdateInput) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;
      const existing = await measurements.findMeasurement(ownerId, measurementId);
      if (!existing) return undefined;
      const patient = await patients.findPatientOwner(ownerId, existing.pacienteId);
      if (!patient) return undefined;
      // const values = {
      //   data: input.data ?? formatDate(existing.data),
      //   pesoKg: input.pesoKg ?? Number(existing.pesoKg),
      //   alturaCm: input.alturaCm ?? Number(existing.alturaCm),
      //   nivelAtividade: input.nivelAtividade ?? existing.nivelAtividade,
      //   circunferencias: input.circunferencias ?? existing.circunferencias ?? undefined
      // } as MeasurementCreateInput;
      // const nutritionistSettings = await settings.findNutritionistSettings(ownerId);
      // if (!nutritionistSettings) return undefined;

      return undefined;
      // const metrics = calculateMetrics(nutritionistSettings, patient, input);
      // return measurements.updateMeasurement(ownerId, measurementId, { ...toMeasurementData(values), ...metrics });
    },
    async remove(sessionId: string, measurementId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      return ownerId ? measurements.deleteMeasurement(ownerId, measurementId) : null;
    }
  };
}

function calculateMetrics(
  nutritionistSettings: Awaited<
    ReturnType<SettingsRepository["findNutritionistSettings"]>
  > & {},
  patient: { dataNascimento: Date; sexo: "M" | "F" },
  input: MeasurementCreateInput
) {
  const formula = nutritionistSettings.formulaPadrao;
  const factor = nutritionistSettings.fatoresAtividade[input.nivelAtividade];

  if (factor === undefined) {
    throw new Error(
      `Fator de atividade não configurado: ${input.nivelAtividade}`
    );
  }

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
