import type { AuthPrisma } from "../types/auth.js";

export type PasswordResetRepository = {
  createPasswordReset: (data: {
    nutricionistaId: string;
    tokenHash: string;
    expiraEm: Date;
  }) => Promise<unknown>;
  findValidPasswordReset: (tokenHash: string) => Promise<{ id: string; nutricionistaId: string } | null>;
  claimPasswordReset: (id: string, tokenHash: string, usadoEm: Date) => Promise<number>;
};

export function createPasswordResetRepository(prisma: AuthPrisma): PasswordResetRepository {
  return {
    createPasswordReset: (data) => prisma.resetSenha.create({ data }),

    findValidPasswordReset: (tokenHash) =>
      prisma.resetSenha.findFirst({
        where: { tokenHash, usadoEm: null, expiraEm: { gt: new Date() } },
        select: { id: true, nutricionistaId: true },
      }),

    claimPasswordReset: (id, tokenHash, usadoEm) =>
      prisma.resetSenha
        .updateMany({
          where: { id, tokenHash, usadoEm: null },
          data: { usadoEm },
        })
        .then((result) => result.count),
  };
}