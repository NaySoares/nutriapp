import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import type { PasswordResetEmail } from "../email.js";
import type { AuthRepository } from "../repositories/authRepository.js";

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export const tokenHash = (token: string): string => createHash("sha256").update(token).digest("hex");

const defaultActivityFactors = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  ativo: 1.725,
  muito_ativo: 1.9
};

export function createAuthService(repository: AuthRepository, sendResetEmail: (email: PasswordResetEmail) => Promise<void>) {
  return {
    async register(input: { email: string; senha: string; nome: string }) {
      const senhaHash = await argon2.hash(input.senha, { type: argon2.argon2id });
      const nutricionista = await repository.createNutritionist({
        email: input.email.toLowerCase(),
        senhaHash,
        nome: input.nome,
        fatoresAtividade: defaultActivityFactors
      });
      return { nutricionista, session: await createSession(repository, nutricionista.id) };
    },

    async login(input: { email: string; senha: string }) {
      const nutricionista = await repository.findNutritionistByEmail(input.email.toLowerCase());
      if (!nutricionista || !(await argon2.verify(nutricionista.senhaHash, input.senha))) return null;
      return {
        nutricionista: { id: nutricionista.id, email: nutricionista.email, nome: nutricionista.nome },
        session: await createSession(repository, nutricionista.id)
      };
    },

    async requestPasswordReset(email: string) {
      const nutricionista = await repository.findNutritionistByEmail(email.toLowerCase());
      if (!nutricionista) return;
      const token = randomBytes(32).toString("base64url");
      await repository.createPasswordReset({
        nutricionistaId: nutricionista.id,
        tokenHash: tokenHash(token),
        expiraEm: new Date(Date.now() + PASSWORD_RESET_TTL_MS)
      });
      await sendResetEmail({ to: nutricionista.email, token });
    },

    async resetPassword(token: string, novaSenha: string) {
      const hash = tokenHash(token);
      const reset = await repository.findValidPasswordReset(hash);
      if (!reset) return false;
      if (await repository.claimPasswordReset(reset.id, hash, new Date()) !== 1) return false;
      const senhaHash = await argon2.hash(novaSenha, { type: argon2.argon2id });
      await repository.updatePassword(reset.nutricionistaId, senhaHash);
      await repository.revokeSessions(reset.nutricionistaId);
      return true;
    },

    async refresh(refreshToken: string) {
      const session = await repository.findValidSession(tokenHash(refreshToken));
      if (!session) return null;
      const newRefreshToken = randomBytes(32).toString("base64url");
      const rotated = await repository.rotateSession(
        session.id,
        tokenHash(refreshToken),
        tokenHash(newRefreshToken),
        new Date(Date.now() + REFRESH_TTL_MS)
      );
      return rotated === 1 ? { sessionId: session.id, refreshToken: newRefreshToken } : null;
    },

    revokeSession(sessionId: string | undefined, refreshToken: string | undefined) {
      if (sessionId) return repository.revokeSession({ id: sessionId });
      if (refreshToken) return repository.revokeSession({ refreshTokenHash: tokenHash(refreshToken) });
      return Promise.resolve(0);
    }
  };
}

async function createSession(repository: AuthRepository, nutricionistaId: string) {
  const refreshToken = randomBytes(32).toString("base64url");
  const session = await repository.createSession({
    nutricionistaId,
    refreshTokenHash: tokenHash(refreshToken),
    expiraEm: new Date(Date.now() + REFRESH_TTL_MS)
  });
  return { id: session.id, refreshToken };
}

export type AuthService = ReturnType<typeof createAuthService>;
