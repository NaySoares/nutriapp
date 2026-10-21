import type { AuthPrisma } from "../types/auth.js";
import { MeasurementRecord, MeasurementSelect } from "../types/measurement.js";
import { asMeasurementClient, MeasurementClient } from "./prismaClientsRepository.js";

export type MeasurementRepository = {
  findPatientOwner: (
    nutritionistId: string,
    patientId: string
  ) => Promise<{ id: string; dataNascimento: Date; sexo: "M" | "F" } | null>;
  createMeasurement: (patientId: string, data: Record<string, unknown>) => Promise<MeasurementRecord>;
  listMeasurements: (nutritionistId: string, patientId: string) => Promise<MeasurementRecord[]>;
  findMeasurement: (nutritionistId: string, measurementId: string) => Promise<MeasurementRecord | null>;
  updateMeasurement: (
    nutritionistId: string,
    measurementId: string,
    data: Record<string, unknown>
  ) => Promise<MeasurementRecord | null>;
  deleteMeasurement: (nutritionistId: string, measurementId: string) => Promise<boolean>;
};

const measurementSelect: MeasurementSelect = {
  id: true, pacienteId: true, data: true, pesoKg: true, alturaCm: true,
  circunferencias: true, nivelAtividade: true, tmbKcal: true, getKcal: true,
  imc: true, formulaUsada: true, fatorUsado: true, criadoEm: true, atualizadoEm: true,
};

const ownerSelect = { id: true, dataNascimento: true, sexo: true } as const;

async function findOwnedMeasurement(
  client: MeasurementClient,
  nutritionistId: string,
  measurementId: string
): Promise<MeasurementRecord | null> {
  const measurement = await client.medicao.findFirst({
    where: { id: measurementId },
    select: measurementSelect,
  });
  if (!measurement) return null;

  const owner = await client.paciente.findFirst({
    where: { id: measurement.pacienteId, nutricionistaId: nutritionistId },
    select: ownerSelect,
  });
  return owner ? measurement : null;
}

export function createMeasurementRepository(prisma: AuthPrisma): MeasurementRepository {
  const client = asMeasurementClient(prisma);

  const findPatientOwner: MeasurementRepository["findPatientOwner"] = (nutritionistId, patientId) =>
    client.paciente.findFirst({
      where: { id: patientId, nutricionistaId: nutritionistId },
      select: ownerSelect,
    });

  return {
    findPatientOwner,

    createMeasurement: (patientId, data) =>
      client.medicao.create({ data: { pacienteId: patientId, ...data }, select: measurementSelect }),

    listMeasurements: async (nutritionistId, patientId) => {
      const owner = await findPatientOwner(nutritionistId, patientId);
      return owner
        ? client.medicao.findMany({
            where: { pacienteId: patientId },
            orderBy: { data: "desc" },
            select: measurementSelect,
          })
        : [];
    },

    findMeasurement: (nutritionistId, measurementId) =>
      findOwnedMeasurement(client, nutritionistId, measurementId),

    updateMeasurement: async (nutritionistId, measurementId, data) => {
      const owned = await findOwnedMeasurement(client, nutritionistId, measurementId);
      return owned
        ? client.medicao.update({ where: { id: measurementId }, data, select: measurementSelect })
        : null;
    },

    deleteMeasurement: async (nutritionistId, measurementId) => {
      const owned = await findOwnedMeasurement(client, nutritionistId, measurementId);
      if (!owned) return false;
      await client.medicao.delete({ where: { id: measurementId } });
      return true;
    },
  };
}