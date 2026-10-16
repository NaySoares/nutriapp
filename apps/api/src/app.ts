import Fastify, { type FastifyInstance, type FastifyReply } from "fastify";
import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import argon2 from "argon2";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  apiErrorSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from "@nutriapp/shared";
import { sendPasswordResetEmail, type PasswordResetEmail } from "./email.js";

export type AuthPrisma = {
  nutricionista: {
    create: (args: {
      data: {
        email: string;
        senhaHash: string;
        nome: string;
        fatoresAtividade: Record<string, number>;
      };
      select: { id: true; email: true; nome: true };
    }) => Promise<{ id: string; email: string; nome: string }>;
    findUnique: (args: {
      where: { email: string };
      select: { id: true; email: true; nome: true; senhaHash: true };
    }) => Promise<{ id: string; email: string; nome: string; senhaHash: string } | null>;
    update: (args: {
      where: { id: string };
      data: { senhaHash: string };
    }) => Promise<unknown>;
  };
  sessao: {
    create: (args: {
      data: { nutricionistaId: string; refreshTokenHash: string; expiraEm: Date };
    }) => Promise<{ id: string; nutricionistaId: string }>;
    findFirst: (args: {
      where: {
        refreshTokenHash: string;
        revogadaEm: null;
        expiraEm: { gt: Date };
      };
      select: { id: true; nutricionistaId: true };
    }) => Promise<{ id: string; nutricionistaId: string } | null>;
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<{ count: number }>;
  };
  resetSenha: {
    create: (args: {
      data: { nutricionistaId: string; tokenHash: string; expiraEm: Date };
    }) => Promise<unknown>;
    findFirst: (args: {
      where: { tokenHash: string; usadoEm: null; expiraEm: { gt: Date } };
      select: { id: true; nutricionistaId: true };
    }) => Promise<{ id: string; nutricionistaId: string } | null>;
    updateMany: (args: {
      where: { id: string; tokenHash: string; usadoEm: null };
      data: { usadoEm: Date };
    }) => Promise<{ count: number }>;
  };
};

const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("api")
});

const ACCESS_COOKIE = "nutri_access";
const REFRESH_COOKIE = "nutri_refresh";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres.");
  }
  return secret;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createAccessToken(sessionId: string): string {
  const payload = Buffer.from(JSON.stringify({
    sessionId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS
  })).toString("base64url");
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
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const data = z.object({ sessionId: z.string().uuid(), exp: z.number() }).parse(parsed);
    return data.exp > Math.floor(Date.now() / 1000) ? data.sessionId : undefined;
  } catch {
    return undefined;
  }
}

function setAuthCookies(reply: FastifyReply, sessionId: string, refreshToken: string): void {
  const secure = process.env.NODE_ENV === "production";
  reply.setCookie(ACCESS_COOKIE, createAccessToken(sessionId), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS
  });
  reply.setCookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_TTL_MS / 1000
  });
}

function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE, { path: "/" });
  reply.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function buildApp(
  prisma: AuthPrisma = new PrismaClient() as unknown as AuthPrisma,
  sendResetEmail: (email: PasswordResetEmail) => Promise<void> = sendPasswordResetEmail
): FastifyInstance {
  const app = Fastify({
    logger: {
      transport: process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined
    }
  });

  void app.register(sensible);
  void app.register(cookie);

  app.get("/health", async () => healthResponseSchema.parse({ status: "ok", service: "api" }));

  app.post("/auth/register", async (request, reply) => {
    const input = registerSchema.safeParse(request.body);
    if (!input.success) {
      return reply.status(400).send({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: input.error.flatten()
      });
    }

    const senhaHash = await argon2.hash(input.data.senha, { type: argon2.argon2id });
    try {
      const nutricionista = await prisma.nutricionista.create({
        data: {
          email: input.data.email.toLowerCase(),
          senhaHash,
          nome: input.data.nome,
          fatoresAtividade: {
            sedentario: 1.2,
            leve: 1.375,
            moderado: 1.55,
            ativo: 1.725,
            muito_ativo: 1.9
          }
        },
        select: { id: true, email: true, nome: true }
      });
      const refreshToken = randomBytes(32).toString("base64url");
      const session = await prisma.sessao.create({
        data: {
          nutricionistaId: nutricionista.id,
          refreshTokenHash: tokenHash(refreshToken),
          expiraEm: new Date(Date.now() + REFRESH_TTL_MS)
        }
      });
      setAuthCookies(reply, session.id, refreshToken);
      return reply.status(201).send({ nutricionista });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return reply.status(409).send({
          codigo: "EMAIL_JA_CADASTRADO",
          mensagem: "Já existe uma conta com este e-mail."
        });
      }
      throw error;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const input = loginSchema.safeParse(request.body);
    if (!input.success) {
      return reply.status(400).send({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: input.error.flatten()
      });
    }
    const nutricionista = await prisma.nutricionista.findUnique({
      where: { email: input.data.email.toLowerCase() },
      select: { id: true, email: true, nome: true, senhaHash: true }
    });
    if (!nutricionista || !(await argon2.verify(nutricionista.senhaHash, input.data.senha))) {
      return reply.status(401).send({
        codigo: "CREDENCIAIS_INVALIDAS",
        mensagem: "E-mail ou senha inválidos."
      });
    }
    const refreshToken = randomBytes(32).toString("base64url");
    const session = await prisma.sessao.create({
      data: {
        nutricionistaId: nutricionista.id,
        refreshTokenHash: tokenHash(refreshToken),
        expiraEm: new Date(Date.now() + REFRESH_TTL_MS)
      }
    });
    setAuthCookies(reply, session.id, refreshToken);
    return reply.send({
      nutricionista: {
        id: nutricionista.id,
        email: nutricionista.email,
        nome: nutricionista.nome
      }
    });
  });

  app.post("/auth/forgot-password", async (request, reply) => {
    const input = forgotPasswordSchema.safeParse(request.body);
    if (!input.success) {
      return reply.status(400).send({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: input.error.flatten()
      });
    }
    const genericResponse = {
      status: "ok",
      mensagem: "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha."
    };
    const nutricionista = await prisma.nutricionista.findUnique({
      where: { email: input.data.email.toLowerCase() },
      select: { id: true, email: true, nome: true, senhaHash: true }
    });
    if (!nutricionista) return reply.send(genericResponse);
    const token = randomBytes(32).toString("base64url");
    await prisma.resetSenha.create({
      data: {
        nutricionistaId: nutricionista.id,
        tokenHash: tokenHash(token),
        expiraEm: new Date(Date.now() + 60 * 60 * 1000)
      }
    });
    await sendResetEmail({ to: nutricionista.email, token });
    return reply.send(genericResponse);
  });

  app.post("/auth/reset-password", async (request, reply) => {
    const input = resetPasswordSchema.safeParse(request.body);
    if (!input.success) {
      return reply.status(400).send({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: input.error.flatten()
      });
    }
    const reset = await prisma.resetSenha.findFirst({
      where: { tokenHash: tokenHash(input.data.token), usadoEm: null, expiraEm: { gt: new Date() } },
      select: { id: true, nutricionistaId: true }
    });
    if (!reset) {
      return reply.status(400).send({
        codigo: "TOKEN_INVALIDO",
        mensagem: "O token é inválido ou expirou."
      });
    }
    const claimed = await prisma.resetSenha.updateMany({
      where: { id: reset.id, tokenHash: tokenHash(input.data.token), usadoEm: null },
      data: { usadoEm: new Date() }
    });
    if (claimed.count !== 1) {
      return reply.status(400).send({
        codigo: "TOKEN_INVALIDO",
        mensagem: "O token é inválido ou expirou."
      });
    }
    const senhaHash = await argon2.hash(input.data.novaSenha, { type: argon2.argon2id });
    await prisma.nutricionista.update({
      where: { id: reset.nutricionistaId },
      data: { senhaHash }
    });
    await prisma.sessao.updateMany({
      where: { nutricionistaId: reset.nutricionistaId, revogadaEm: null },
      data: { revogadaEm: new Date() }
    });
    return reply.send({ status: "ok" });
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      return reply.status(401).send({
        codigo: "SESSAO_INVALIDA",
        mensagem: "A sessão é inválida ou expirou."
      });
    }
    const session = await prisma.sessao.findFirst({
      where: {
        refreshTokenHash: tokenHash(refreshToken),
        revogadaEm: null,
        expiraEm: { gt: new Date() }
      },
      select: { id: true, nutricionistaId: true }
    });
    if (!session) {
      clearAuthCookies(reply);
      return reply.status(401).send({
        codigo: "SESSAO_INVALIDA",
        mensagem: "A sessão é inválida ou expirou."
      });
    }
    const newRefreshToken = randomBytes(32).toString("base64url");
    const rotated = await prisma.sessao.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: tokenHash(refreshToken),
        revogadaEm: null
      },
      data: {
        refreshTokenHash: tokenHash(newRefreshToken),
        expiraEm: new Date(Date.now() + REFRESH_TTL_MS)
      }
    });
    if (rotated.count !== 1) {
      clearAuthCookies(reply);
      return reply.status(401).send({
        codigo: "SESSAO_INVALIDA",
        mensagem: "A sessão já foi atualizada ou revogada."
      });
    }
    setAuthCookies(reply, session.id, newRefreshToken);
    return reply.send({ status: "ok" });
  });

  app.post("/auth/logout", async (request, reply) => {
    const accessSessionId = readAccessToken(request.cookies[ACCESS_COOKIE]);
    const refreshToken = request.cookies[REFRESH_COOKIE];
    if (accessSessionId) {
      await prisma.sessao.updateMany({
        where: { id: accessSessionId, revogadaEm: null },
        data: { revogadaEm: new Date() }
      });
    } else if (refreshToken) {
      await prisma.sessao.updateMany({
        where: { refreshTokenHash: tokenHash(refreshToken), revogadaEm: null },
        data: { revogadaEm: new Date() }
      });
    }
    clearAuthCookies(reply);
    return reply.send({ status: "ok" });
  });

  app.setErrorHandler((error, request, reply) => {
    const details = error as { validation?: unknown; statusCode?: number; message?: string };
    request.log.error(error);
    if (details.validation) {
      return reply.status(400).send(apiErrorSchema.parse({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: details.validation
      }));
    }
    return reply.status(details.statusCode ?? 500).send(apiErrorSchema.parse({
      codigo: details.statusCode ? "REQUISICAO_INVALIDA" : "ERRO_INTERNO",
      mensagem: details.statusCode ? details.message ?? "Requisição inválida." : "Ocorreu um erro interno."
    }));
  });

  return app;
}
