import type { FastifyReply, FastifyRequest } from "fastify";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@nutriapp/shared";
import { z } from "zod";
import type { AuthService } from "../services/authService.js";

export const ACCESS_COOKIE = "nutri_access";
export const REFRESH_COOKIE = "nutri_refresh";

export function createAuthController(service: AuthService) {
  return {
    register: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = registerSchema.safeParse(request.body);
      if (!input.success) return invalidInput(reply, input.error.flatten());
      try {
        const result = await service.register(input.data);
        setAuthCookies(reply, result.session.id, result.session.refreshToken);
        return reply.status(201).send({ nutricionista: result.nutricionista });
      } catch (error) {
        if (isUniqueConstraintError(error)) return reply.status(409).send({
          codigo: "EMAIL_JA_CADASTRADO",
          mensagem: "Já existe uma conta com este e-mail."
        });
        throw error;
      }
    },

    login: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = loginSchema.safeParse(request.body);
      if (!input.success) return invalidInput(reply, input.error.flatten());
      const result = await service.login(input.data);
      if (!result) return reply.status(401).send({ codigo: "CREDENCIAIS_INVALIDAS", mensagem: "E-mail ou senha inválidos." });
      setAuthCookies(reply, result.session.id, result.session.refreshToken);
      return reply.send({ nutricionista: result.nutricionista });
    },

    forgotPassword: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = forgotPasswordSchema.safeParse(request.body);
      if (!input.success) return invalidInput(reply, input.error.flatten());
      await service.requestPasswordReset(input.data.email);
      return reply.send(genericResetResponse);
    },

    resetPassword: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = resetPasswordSchema.safeParse(request.body);
      if (!input.success) return invalidInput(reply, input.error.flatten());
      if (!await service.resetPassword(input.data.token, input.data.novaSenha)) {
        return reply.status(400).send({ codigo: "TOKEN_INVALIDO", mensagem: "O token é inválido ou expirou." });
      }
      return reply.send({ status: "ok" });
    },

    refresh: async (request: FastifyRequest, reply: FastifyReply) => {
      const refreshToken = request.cookies[REFRESH_COOKIE];
      if (!refreshToken) return invalidSession(reply, "A sessão é inválida ou expirou.");
      const result = await service.refresh(refreshToken);
      if (!result) {
        clearAuthCookies(reply);
        return invalidSession(reply, "A sessão é inválida ou expirou.");
      }
      setAuthCookies(reply, result.sessionId, result.refreshToken);
      return reply.send({ status: "ok" });
    },

    logout: async (request: FastifyRequest, reply: FastifyReply) => {
      await service.revokeSession(readAccessToken(request.cookies[ACCESS_COOKIE]), request.cookies[REFRESH_COOKIE]);
      clearAuthCookies(reply);
      return reply.send({ status: "ok" });
    }
  };
}

const genericResetResponse = {
  status: "ok",
  mensagem: "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha."
};

function invalidInput(reply: FastifyReply, detalhes: unknown) {
  return reply.status(400).send({ codigo: "VALIDACAO_INVALIDA", mensagem: "Os dados enviados são inválidos.", detalhes });
}

function invalidSession(reply: FastifyReply, mensagem: string) {
  return reply.status(401).send({ codigo: "SESSAO_INVALIDA", mensagem });
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres.");
  return secret;
}

function createAccessToken(sessionId: string): string {
  const payload = Buffer.from(JSON.stringify({ sessionId, exp: Math.floor(Date.now() / 1000) + 15 * 60 })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readAccessToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return undefined;

  const expected = createHmac("sha256", sessionSecret()).update(payload).digest();
  const received = Buffer.from(signature, "base64url");

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return undefined;
  try {
    const data = z.object({ sessionId: z.string().uuid(), exp: z.number() }).parse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    );
    return data.exp > Date.now() / 1000 ? data.sessionId : undefined;
  } catch {
    return undefined;
  }
}

function setAuthCookies(reply: FastifyReply, sessionId: string, refreshToken: string): void {
  const secure = process.env.NODE_ENV === "production";
  reply.setCookie(ACCESS_COOKIE, createAccessToken(sessionId), { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 15 * 60 });
  reply.setCookie(REFRESH_COOKIE, refreshToken, { httpOnly: true, secure, sameSite: "lax", path: "/api/auth", maxAge: 30 * 24 * 60 * 60 });
}

function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE, { path: "/" });
  reply.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

import { createHmac, timingSafeEqual } from "node:crypto";
