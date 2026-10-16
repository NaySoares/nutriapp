import type { AuthPrisma } from "../types/auth.js";

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

  createSession: (data: {
    nutricionistaId: string;
    refreshTokenHash: string;
    expiraEm: Date;
  }) => Promise<{ id: string; nutricionistaId: string }>;

  findValidSession: (refreshTokenHash: string) => Promise<{
    id: string;
    nutricionistaId: string;
  } | null>;

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
  };
}
