
import type { Prisma, PrismaClient } from "@prisma/client";
import type { MeasurementRecord, MeasurementSelect } from "../types/measurement.js";

type Db = Pick<PrismaClient, "paciente" | "medicao">;

export type MeasurementRepository = {
  findPatientOwner: (
    nutritionistId: string,
    patientId: string
  ) => Promise<{ id: string; dataNascimento: Date; sexo: "M" | "F" } | null>;

  createMeasurement: (
    patientId: string,
    data: Omit<Prisma.MedicaoUncheckedCreateInput, "pacienteId">
  ) => Promise<MeasurementRecord>;

  listMeasurements: (
    nutritionistId: string,
    patientId: string
  ) => Promise<MeasurementRecord[]>;

  findMeasurement: (
    nutritionistId: string,
    measurementId: string
  ) => Promise<MeasurementRecord | null>;

  updateMeasurement: (
    nutritionistId: string,
    measurementId: string,
    data: Record<string, unknown>
  ) => Promise<MeasurementRecord | null>;

  deleteMeasurement: (
    nutritionistId: string,
    measurementId: string
  ) => Promise<boolean>;
};

const measurementSelect: MeasurementSelect = {
  id: true,
  pacienteId: true,
  data: true,
  pesoKg: true,
  alturaCm: true,
  circunferencias: true,
  nivelAtividade: true,
  tmbKcal: true,
  getKcal: true,
  imc: true,
  formulaUsada: true,
  fatorUsado: true,
  criadoEm: true,
  atualizadoEm: true,
};

const ownerSelect = {
  id: true,
  dataNascimento: true,
  sexo: true,
} as const;

async function findOwnedMeasurement(
  prisma: Db,
  nutritionistId: string,
  measurementId: string
): Promise<MeasurementRecord | null> {
  const measurement = await prisma.medicao.findFirst({
    where: { id: measurementId },
    select: measurementSelect,
  });

  if (!measurement) return null;

  const owner = await prisma.paciente.findFirst({
    where: {
      id: measurement.pacienteId,
      nutricionistaId: nutritionistId,
    },
    select: ownerSelect,
  });

  return owner ? measurement : null;
}

export function createMeasurementRepository(
  prisma: Db
): MeasurementRepository {
  const findPatientOwner: MeasurementRepository["findPatientOwner"] = (
    nutritionistId,
    patientId
  ) =>
    prisma.paciente.findFirst({
      where: {
        id: patientId,
        nutricionistaId: nutritionistId,
      },
      select: ownerSelect,
    });

  return {
    findPatientOwner,

    createMeasurement: (patientId, data) =>
      prisma.medicao.create({
        data: { pacienteId: patientId, ...data },
        select: measurementSelect,
      }),

    listMeasurements: async (nutritionistId, patientId) => {
      const owner = await findPatientOwner(nutritionistId, patientId);

      return owner
        ? prisma.medicao.findMany({
            where: { pacienteId: patientId },
            orderBy: { data: "desc" },
            select: measurementSelect,
          })
        : [];
    },

    findMeasurement: (nutritionistId, measurementId) =>
      findOwnedMeasurement(prisma, nutritionistId, measurementId),

    updateMeasurement: async (nutritionistId, measurementId, data) => {
      const owned = await findOwnedMeasurement(
        prisma,
        nutritionistId,
        measurementId
      );

      return owned
        ? prisma.medicao.update({
            where: { id: measurementId },
            data,
            select: measurementSelect,
          })
        : null;
    },

    deleteMeasurement: async (nutritionistId, measurementId) => {
      const owned = await findOwnedMeasurement(
        prisma,
        nutritionistId,
        measurementId
      );

      if (!owned) return false;

      await prisma.medicao.delete({
        where: { id: measurementId },
      });

      return true;
    },
  };
}
