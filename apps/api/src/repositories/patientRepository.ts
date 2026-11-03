import { PatientCreateInput, PatientUpdateInput, PatientRecord, PatientSelect, PatientPage, PatientFilters} from "@nutriapp/shared";
import type { Prisma, PrismaClient } from "@prisma/client";

type Db = Pick<PrismaClient, "paciente">;

export type PatientRepository = ReturnType<typeof createPatientRepository>;

const patientSelect: PatientSelect = {
  id: true,
  cpf: true,
  nutricionistaId: true,
  nome: true,
  dataNascimento: true,
  sexo: true,
  contato: true,
  email: true,
  telefone: true,
  anamnese: true,
  arquivadoEm: true,
  status: true,
  criadoEm: true,
  atualizadoEm: true,
};

const ownerSelect = {
  id: true,
  nome: true,
  contato: true,
  dataNascimento: true,
  sexo: true,
  status: true,
} satisfies Prisma.PacienteSelect;

type Row = Prisma.PacienteGetPayload<{ select: typeof patientSelect }>;

const toRecord = (row: Row): PatientRecord => ({
  ...row,
  anamnese: row.anamnese ?? null,
  email: row.email ?? null,
  telefone: row.telefone ?? null,
  arquivadoEm: row.arquivadoEm ?? null,
});

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export function createPatientRepository(db: Db) {

  const findPatientOwner = async (
    nutritionistId: string,
    patientId: string
  ) =>
    db.paciente.findFirst({
      where: {
        id: patientId,
        nutricionistaId: nutritionistId,
      },
      select: ownerSelect,
    });


  return {
    findPatientOwner,

    createPatient: (nutritionistId: string, data: PatientCreateInput) =>
      db.paciente.create({
        data: { nutricionistaId: nutritionistId, ...data },
        select: patientSelect,
    }),

    async listPatients(nutritionistId: string, includeArchived = false, filters: PatientFilters): Promise<PatientPage> {
      const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
      const page = Math.max(filters.page ?? 1, 1);

      const where: Prisma.PacienteWhereInput = {
          nutricionistaId: nutritionistId,
          arquivadoEm: includeArchived ? undefined : null,
          ...(filters.q ? { nome: { contains: filters.q, mode: "insensitive" } } : {}),
      };

      const [rows, total] = await Promise.all([
        db.paciente.findMany({
          where,
          orderBy: [{ nome: "asc" }, {id: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: patientSelect,
        }),
        db.paciente.count({ where }),
      ]);

      return { items: rows.map(toRecord), total, page, pageSize };
    },

    findPatient: (nutritionistId: string, patientId: string) =>
      db.paciente.findFirst({
        where: { id: patientId, nutricionistaId: nutritionistId },
        select: patientSelect,
      }),

    updatePatient: async (nutritionistId: string, patientId: string, data: Partial<PatientUpdateInput>) =>
      (
        await db.paciente.updateMany({
          where: { id: patientId, nutricionistaId: nutritionistId, arquivadoEm: null },
          data,
        })
      ).count === 1,

    archivePatient: async (nutritionistId: string, patientId: string) =>
      (
        await db.paciente.updateMany({
          where: { id: patientId, nutricionistaId: nutritionistId, arquivadoEm: null },
          data: { arquivadoEm: new Date() },
        })
      ).count === 1,
  };
}