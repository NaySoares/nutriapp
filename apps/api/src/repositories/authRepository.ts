import type { AuthPrisma, PatientRecord, PatientSelect } from "../types/auth.js";

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
    })).count === 1
  };
}
