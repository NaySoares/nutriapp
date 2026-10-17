import type { AuthPrisma, MeasurementRecord, MeasurementSelect, PatientRecord, PatientSelect } from "../types/auth.js";
import { DEFAULT_ACTIVITY_FACTORS } from "@nutriapp/shared";

export type AuthRepository = {
  createNutritionist: (data: {
    email: string;
    senhaHash: string;
    nome: string;
    fatoresAtividade: Record<string, number>;
  }) => Promise<{ id: string; email: string; nome: string }>;

  findNutritionistByEmail: (email: string) => Promise<{
    id: string;
    email: string;
    nome: string;
    senhaHash: string;
  } | null>;

  updatePassword: (id: string, senhaHash: string) => Promise<unknown>;
  findProfile: (id: string) => Promise<{
    id: string;
    email: string;
    nome: string;
    crn: string | null;
    logoPath: string | null;
  } | null>;
  updateProfile: (id: string, data: { nome?: string; crn?: string | null; logoPath?: string }) => Promise<{
    id: string;
    email: string;
    nome: string;
    crn: string | null;
    logoPath: string | null;
  }>;

  createSession: (data: {
    nutricionistaId: string;
    refreshTokenHash: string;
    expiraEm: Date;
  }) => Promise<{ id: string; nutricionistaId: string }>;

  findValidSession: (refreshTokenHash: string) => Promise<{
    id: string;
    nutricionistaId: string;
  } | null>;
  findSessionOwner: (sessionId: string) => Promise<string | null>;

  rotateSession: (id: string, refreshTokenHash: string, newRefreshTokenHash: string, expiraEm: Date) => Promise<number>;

  revokeSession: (where: Record<string, unknown>) => Promise<number>;

  createPasswordReset: (data: {
    nutricionistaId: string;
    tokenHash: string;
    expiraEm: Date;
  }) => Promise<unknown>;

  findValidPasswordReset: (tokenHash: string) => Promise<{
    id: string;
    nutricionistaId: string;
  } | null>;

  claimPasswordReset: (id: string, tokenHash: string, usadoEm: Date) => Promise<number>;

  revokeSessions: (nutricionistaId: string) => Promise<number>;
  createPatient: (nutritionistId: string, data: {
    nome: string;
    dataNascimento: Date;
    sexo: "M" | "F";
    contato?: string;
    anamnese?: string;
  }) => Promise<PatientRecord>;
  listPatients: (nutritionistId: string, search?: string, includeArchived?: boolean) => Promise<PatientRecord[]>;
  findPatient: (nutritionistId: string, patientId: string) => Promise<PatientRecord | null>;
  updatePatient: (nutritionistId: string, patientId: string, data: {
    nome?: string;
    dataNascimento?: Date;
    sexo?: "M" | "F";
    contato?: string | null;
    anamnese?: string | null;
  }) => Promise<boolean>;
  archivePatient: (nutritionistId: string, patientId: string) => Promise<boolean>;
  findNutritionistSettings: (id: string) => Promise<{ formulaPadrao: "mifflin" | "harris_benedict"; fatoresAtividade: Record<string, number> } | null>;
  findPatientOwner: (nutritionistId: string, patientId: string) => Promise<{ id: string; dataNascimento: Date; sexo: "M" | "F" } | null>;
  createMeasurement: (patientId: string, data: Record<string, unknown>) => Promise<MeasurementRecord>;
  listMeasurements: (nutritionistId: string, patientId: string) => Promise<MeasurementRecord[]>;
  findMeasurement: (nutritionistId: string, measurementId: string) => Promise<MeasurementRecord | null>;
  updateMeasurement: (nutritionistId: string, measurementId: string, data: Record<string, unknown>) => Promise<MeasurementRecord | null>;
  deleteMeasurement: (nutritionistId: string, measurementId: string) => Promise<boolean>;
  findSettings: (id: string) => Promise<{ formulaPadrao: "mifflin" | "harris_benedict"; fatoresAtividade: Record<string, number> } | null>;
  updateSettings: (id: string, data: { formulaPadrao: "mifflin" | "harris_benedict"; fatoresAtividade: Record<string, number> }) => Promise<{
    formulaPadrao: "mifflin" | "harris_benedict";
    fatoresAtividade: Record<string, number>;
  }>;
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
  atualizadoEm: true
};
const measurementSelect: MeasurementSelect = {
  id: true, pacienteId: true, data: true, pesoKg: true, alturaCm: true,
  circunferencias: true, nivelAtividade: true, tmbKcal: true, getKcal: true,
  imc: true, formulaUsada: true, fatorUsado: true, criadoEm: true, atualizadoEm: true
};

type ProfileClient = {
  nutricionista: {
    findUnique: (args: {
      where: { id: string };
      select: { id: true; email: true; nome: true; crn: true; logoPath: true };
    }) => Promise<{
      id: string;
      email: string;
      nome: string;
      crn: string | null;
      logoPath: string | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: { nome?: string; crn?: string | null; logoPath?: string };
      select: { id: true; email: true; nome: true; crn: true; logoPath: true };
    }) => Promise<{
      id: string;
      email: string;
      nome: string;
      crn: string | null;
      logoPath: string | null;
    }>;
  }
};

type MeasurementClient = {
    nutricionista: {
      findUnique: (args: { where: { id: string }; select: { formulaPadrao: true; fatoresAtividade: true } }) =>
        Promise<{ formulaPadrao: "mifflin" | "harris_benedict"; fatoresAtividade: unknown } | null>;
      update: (args: { where: { id: string }; data: { formulaPadrao: "mifflin" | "harris_benedict"; fatoresAtividade: Record<string, number> }; select: { formulaPadrao: true; fatoresAtividade: true } }) =>
        Promise<{ formulaPadrao: "mifflin" | "harris_benedict"; fatoresAtividade: unknown }>;
    };
    paciente: {
      findFirst: (args: { where: { id: string; nutricionistaId: string }; select: { id: true; dataNascimento: true; sexo: true } }) =>
        Promise<{ id: string; dataNascimento: Date; sexo: "M" | "F" } | null>;
    };
    medicao: {
      create: (args: { data: Record<string, unknown>; select: MeasurementSelect }) => Promise<MeasurementRecord>;
      findMany: (args: { where: { pacienteId: string }; orderBy: { data: "desc" }; select: MeasurementSelect }) => Promise<MeasurementRecord[]>;
      findFirst: (args: { where: { id: string }; select: MeasurementSelect }) => Promise<MeasurementRecord | null>;
      update: (args: { where: { id: string }; data: Record<string, unknown>; select: MeasurementSelect }) => Promise<MeasurementRecord>;
      delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
};

export function createAuthRepository(prisma: AuthPrisma): AuthRepository {
  return {
    createNutritionist: (data) => prisma.nutricionista.create({
      data,
      select: { id: true, email: true, nome: true }
    }),

    findNutritionistByEmail: (email) => prisma.nutricionista.findUnique({
      where: { email },
      select: { id: true, email: true, nome: true, senhaHash: true }
    }),

    updatePassword: (id, senhaHash) => prisma.nutricionista.update({
      where: { id },
      data: { senhaHash }
    }),
    findProfile: (id) => (prisma as unknown as ProfileClient).nutricionista.findUnique({
      where: { id },
      select: { id: true, email: true, nome: true, crn: true, logoPath: true }
    }),
    updateProfile: (id, data) => (prisma as unknown as ProfileClient).nutricionista.update({
      where: { id },
      data,
      select: { id: true, email: true, nome: true, crn: true, logoPath: true }
    }),

    createSession: (data) => prisma.sessao.create({
      data
    }),

    findValidSession: (refreshTokenHash) => prisma.sessao.findFirst({
      where: {
        refreshTokenHash,
        revogadaEm: null,
        expiraEm: { gt: new Date() }
      },
      select: { id: true, nutricionistaId: true }
    }),
    findSessionOwner: (sessionId) => prisma.sessao.findUnique({
      where: { id: sessionId, revogadaEm: null, expiraEm: { gt: new Date() } },
      select: { nutricionistaId: true }
    }).then((session) => session?.nutricionistaId ?? null),
    rotateSession: (id, refreshTokenHash, newRefreshTokenHash, expiraEm) => prisma.sessao.updateMany({
      where: { id, refreshTokenHash, revogadaEm: null },
      data: { refreshTokenHash: newRefreshTokenHash, expiraEm }
    }).then((result) => result.count),

    revokeSession: (where) => prisma.sessao.updateMany({
      where: { ...where, revogadaEm: null },
      data: { revogadaEm: new Date() }
    }).then((result) => result.count),

    createPasswordReset: (data) => prisma.resetSenha.create({ data }),

    findValidPasswordReset: (tokenHash) => prisma.resetSenha.findFirst({
      where: { tokenHash, usadoEm: null, expiraEm: { gt: new Date() } },
      select: { id: true, nutricionistaId: true }
    }),

    claimPasswordReset: (id, tokenHash, usadoEm) => prisma.resetSenha.updateMany({
      where: { id, tokenHash, usadoEm: null },
      data: { usadoEm }
    }).then((result) => result.count),

    revokeSessions: (nutricionistaId) => prisma.sessao.updateMany({
      where: { nutricionistaId, revogadaEm: null },
      data: { revogadaEm: new Date() }
    }).then((result) => result.count)
    ,
    createPatient: (nutritionistId, data) => prisma.paciente.create({
      data: { nutricionistaId: nutritionistId, ...data },
      select: patientSelect
    }),
    listPatients: (nutritionistId, search, includeArchived = false) => prisma.paciente.findMany({
      where: {
        nutricionistaId: nutritionistId,
        arquivadoEm: includeArchived ? undefined : null,
        ...(search ? { nome: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { nome: "asc" },
      select: patientSelect
    }),
    findPatient: (nutritionistId, patientId) => prisma.paciente.findFirst({
      where: { id: patientId, nutricionistaId: nutritionistId },
      select: patientSelect
    }),
    updatePatient: async (nutritionistId, patientId, data) => (await prisma.paciente.updateMany({
      where: { id: patientId, nutricionistaId: nutritionistId, arquivadoEm: null },
      data
    })).count === 1,
    archivePatient: async (nutritionistId, patientId) => (await prisma.paciente.updateMany({
      where: { id: patientId, nutricionistaId: nutritionistId, arquivadoEm: null },
      data: { arquivadoEm: new Date() }
    })).count === 1,
    findNutritionistSettings: (id) => (prisma as unknown as MeasurementClient).nutricionista.findUnique({ where: { id }, select: { formulaPadrao: true, fatoresAtividade: true } })
      .then((settings) => settings && {
        formulaPadrao: settings.formulaPadrao,
        fatoresAtividade: settings.fatoresAtividade as Record<string, number>
      }),
    findPatientOwner: (nutritionistId, patientId) => (prisma as unknown as MeasurementClient).paciente.findFirst({
      where: { id: patientId, nutricionistaId: nutritionistId },
      select: { id: true, dataNascimento: true, sexo: true }
    }),
    createMeasurement: (patientId, data) => (prisma as unknown as MeasurementClient).medicao.create({ data: { pacienteId: patientId, ...data }, select: measurementSelect }),
    listMeasurements: async (nutritionistId, patientId) => {
      const owner = await (prisma as unknown as MeasurementClient).paciente.findFirst({
        where: { id: patientId, nutricionistaId: nutritionistId },
        select: { id: true, dataNascimento: true, sexo: true }
      });
      return owner ? (prisma as unknown as MeasurementClient).medicao.findMany({ where: { pacienteId: patientId }, orderBy: { data: "desc" }, select: measurementSelect }) : [];
    },
    findMeasurement: async (nutritionistId, measurementId) => {
      const measurement = await (prisma as unknown as MeasurementClient).medicao.findFirst({
        where: { id: measurementId },
        select: measurementSelect
      });
      if (!measurement) return null;
      const owner = await (prisma as unknown as MeasurementClient).paciente.findFirst({
        where: { id: measurement.pacienteId, nutricionistaId: nutritionistId },
        select: { id: true, dataNascimento: true, sexo: true }
      });
      return owner ? measurement : null;
    },
    updateMeasurement: async (nutritionistId, measurementId, data) => {
      const existing = await (prisma as unknown as MeasurementClient).medicao.findFirst({ where: { id: measurementId }, select: measurementSelect });
      if (!existing) return null;
      const owner = await (prisma as unknown as MeasurementClient).paciente.findFirst({
        where: { id: existing.pacienteId, nutricionistaId: nutritionistId },
        select: { id: true, dataNascimento: true, sexo: true }
      });
      return owner ? (prisma as unknown as MeasurementClient).medicao.update({ where: { id: measurementId }, data, select: measurementSelect }) : null;
    },
    deleteMeasurement: async (nutritionistId, measurementId) => {
      const existing = await (prisma as unknown as MeasurementClient).medicao.findFirst({ where: { id: measurementId }, select: measurementSelect });
      if (!existing) return false;
      const owner = await (prisma as unknown as MeasurementClient).paciente.findFirst({
        where: { id: existing.pacienteId, nutricionistaId: nutritionistId },
        select: { id: true, dataNascimento: true, sexo: true }
      });
      if (!owner) return false;
      await (prisma as unknown as MeasurementClient).medicao.delete({ where: { id: measurementId } });
      return true;
    },
    findSettings: (id) => (prisma as unknown as MeasurementClient).nutricionista.findUnique({
      where: { id },
      select: { formulaPadrao: true, fatoresAtividade: true }
    }).then((settings) => settings && {
      formulaPadrao: settings.formulaPadrao,
      fatoresAtividade: { ...DEFAULT_ACTIVITY_FACTORS, ...(settings.fatoresAtividade as Record<string, number>) }
    }),
    updateSettings: (id, data) => (prisma as unknown as MeasurementClient).nutricionista.update({
      where: { id },
      data,
      select: { formulaPadrao: true, fatoresAtividade: true }
    }).then((settings) => ({
      formulaPadrao: settings.formulaPadrao,
      fatoresAtividade: settings.fatoresAtividade as Record<string, number>
    }))
  };
}
