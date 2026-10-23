import { PatientRecord, PatientSelect } from "@nutriapp/shared";
import type { PrismaClient } from "@prisma/client";

type Db = Pick<PrismaClient, "paciente">;

export type PatientRepository = {
  findPatientOwner: (
    nutritionistId: string,
    patientId: string
  ) => Promise<{ id: string; dataNascimento: Date; sexo: "M" | "F" } | null>;
  createPatient: (
    nutritionistId: string,
    data: {
      nome: string;
      dataNascimento: Date;
      sexo: "M" | "F";
      contato?: string;
      anamnese?: string;
    }
  ) => Promise<PatientRecord>;
  listPatients: (nutritionistId: string, search?: string, includeArchived?: boolean) => Promise<PatientRecord[]>;
  findPatient: (nutritionistId: string, patientId: string) => Promise<PatientRecord | null>;
  updatePatient: (
    nutritionistId: string,
    patientId: string,
    data: {
      nome?: string;
      dataNascimento?: Date;
      sexo?: "M" | "F";
      contato?: string | null;
      anamnese?: string | null;
    }
  ) => Promise<boolean>;
  archivePatient: (nutritionistId: string, patientId: string) => Promise<boolean>;
};

const patientSelect: PatientSelect = {
  id: true,
  nutricionistaId: true,
  nome: true,
  dataNascimento: true,
  sexo: true,
  contato: true,
  anamnese: true,
  arquivadoEm: true,
  criadoEm: true,
  atualizadoEm: true,
};

const ownerSelect = {
  id: true,
  dataNascimento: true,
  sexo: true,
} as const;

export function createPatientRepository(prisma: Db): PatientRepository {

  const findPatientOwner: PatientRepository["findPatientOwner"] = (
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

    createPatient: (nutritionistId, data) =>
      prisma.paciente.create({
        data: { nutricionistaId: nutritionistId, ...data },
        select: patientSelect,
      }),

    listPatients: (nutritionistId, search, includeArchived = false) =>
      prisma.paciente.findMany({
        where: {
          nutricionistaId: nutritionistId,
          arquivadoEm: includeArchived ? undefined : null,
          ...(search ? { nome: { contains: search, mode: "insensitive" } } : {}),
        },
        orderBy: { nome: "asc" },
        select: patientSelect,
      }),

    findPatient: (nutritionistId, patientId) =>
      prisma.paciente.findFirst({
        where: { id: patientId, nutricionistaId: nutritionistId },
        select: patientSelect,
      }),

    updatePatient: async (nutritionistId, patientId, data) =>
      (
        await prisma.paciente.updateMany({
          where: { id: patientId, nutricionistaId: nutritionistId, arquivadoEm: null },
          data,
        })
      ).count === 1,

    archivePatient: async (nutritionistId, patientId) =>
      (
        await prisma.paciente.updateMany({
          where: { id: patientId, nutricionistaId: nutritionistId, arquivadoEm: null },
          data: { arquivadoEm: new Date() },
        })
      ).count === 1,
  };
}