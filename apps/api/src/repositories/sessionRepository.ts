import type { AuthPrisma } from "../types/auth.js";

export type SessionRepository = {
  createSession: (data: {
    nutricionistaId: string;
    refreshTokenHash: string;
    expiraEm: Date;
  }) => Promise<{ id: string; nutricionistaId: string }>;
  findValidSession: (refreshTokenHash: string) => Promise<{ id: string; nutricionistaId: string } | null>;
  findSessionOwner: (sessionId: string) => Promise<string | null>;
  rotateSession: (
    id: string,
    refreshTokenHash: string,
    newRefreshTokenHash: string,
    expiraEm: Date
  ) => Promise<number>;
  revokeSession: (where: Record<string, unknown>) => Promise<number>;
  revokeSessions: (nutricionistaId: string) => Promise<number>;
};

export function createSessionRepository(prisma: AuthPrisma): SessionRepository {
  return {
    createSession: (data) => prisma.sessao.create({ data }),

    findValidSession: (refreshTokenHash) =>
      prisma.sessao.findFirst({
        where: {
          refreshTokenHash,
          revogadaEm: null,
          expiraEm: { gt: new Date() },
        },
        select: { id: true, nutricionistaId: true },
      }),

    findSessionOwner: (sessionId) =>
      prisma.sessao
        .findUnique({
          where: { id: sessionId, revogadaEm: null, expiraEm: { gt: new Date() } },
          select: { nutricionistaId: true },
        })
        .then((session) => session?.nutricionistaId ?? null),

    rotateSession: (id, refreshTokenHash, newRefreshTokenHash, expiraEm) =>
      prisma.sessao
        .updateMany({
          where: { id, refreshTokenHash, revogadaEm: null },
          data: { refreshTokenHash: newRefreshTokenHash, expiraEm },
        })
        .then((result) => result.count),

    revokeSession: (where) =>
      prisma.sessao
        .updateMany({
          where: { ...where, revogadaEm: null },
          data: { revogadaEm: new Date() },
        })
        .then((result) => result.count),

    revokeSessions: (nutricionistaId) =>
      prisma.sessao
        .updateMany({
          where: { nutricionistaId, revogadaEm: null },
          data: { revogadaEm: new Date() },
        })
        .then((result) => result.count),
  };
}