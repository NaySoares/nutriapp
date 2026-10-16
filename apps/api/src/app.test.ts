import { afterEach, describe, expect, it, vi } from "vitest";
import argon2 from "argon2";
import type { FastifyInstance } from "fastify";
import { buildApp, type AuthPrisma } from "./app.js";
import type { PasswordResetEmail } from "./email.js";

process.env.SESSION_SECRET = "test-session-secret-with-at-least-32-characters";

const nutricionista = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "nutri@example.com",
  nome: "Nutricionista Teste"
};

const session = {
  id: "22222222-2222-4222-8222-222222222222",
  nutricionistaId: nutricionista.id
};

function createPrismaMock() {
  const mock = {
    nutricionista: {
      create: vi.fn<AuthPrisma["nutricionista"]["create"]>(),
      findUnique: vi.fn<AuthPrisma["nutricionista"]["findUnique"]>(),
      update: vi.fn<AuthPrisma["nutricionista"]["update"]>()
    },
    sessao: {
      create: vi.fn<AuthPrisma["sessao"]["create"]>(),
      findFirst: vi.fn<AuthPrisma["sessao"]["findFirst"]>(),
      findUnique: vi.fn<AuthPrisma["sessao"]["findUnique"]>(),
      updateMany: vi.fn<AuthPrisma["sessao"]["updateMany"]>()
    },
    resetSenha: {
      create: vi.fn<AuthPrisma["resetSenha"]["create"]>(),
      findFirst: vi.fn<AuthPrisma["resetSenha"]["findFirst"]>(),
      updateMany: vi.fn<AuthPrisma["resetSenha"]["updateMany"]>()
    }
  } satisfies AuthPrisma;

  return mock;
}

type InjectResponse = Awaited<ReturnType<FastifyInstance["inject"]>>;

function setCookies(response: InjectResponse): string[] {
  const cookies = response.headers["set-cookie"];
  expect(cookies).toBeDefined();
  return Array.isArray(cookies) ? cookies : [cookies as string];
}

function cookieHeader(response: InjectResponse): string {
  return setCookies(response).map((cookie) => cookie.split(";")[0]).join("; ");
}

describe("autenticação", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app?.close();
  });

  describe("perfil", () => {
    let app: FastifyInstance;

    afterEach(async () => {
      await app?.close();
    });

    it("exige sessão para consultar e alterar o perfil", async () => {
      const prisma = createPrismaMock();
      app = buildApp(prisma);
      await app.ready();

      const get = await app.inject({ method: "GET", url: "/me" });
      const patch = await app.inject({
        method: "PATCH",
        url: "/me",
        payload: { nome: "Novo nome" }
      });

      expect(get.statusCode).toBe(401);
      expect(patch.statusCode).toBe(401);
      expect(prisma.nutricionista.findUnique).not.toHaveBeenCalled();
    });

    it("consulta e atualiza nome e CRN do nutricionista autenticado", async () => {
      const prisma = createPrismaMock();
      prisma.nutricionista.create.mockResolvedValue(nutricionista);
      prisma.sessao.create.mockResolvedValue(session);
      prisma.nutricionista.findUnique.mockResolvedValue(Object.assign(
        { ...nutricionista, senhaHash: "unused" },
        { crn: "CRN-123", logoPath: null }
      ));
      prisma.sessao.findUnique.mockResolvedValue({ nutricionistaId: nutricionista.id });
      prisma.nutricionista.update.mockResolvedValue({
        ...nutricionista,
        crn: "CRN-123",
        logoPath: null
      });
      app = buildApp(prisma);
      await app.ready();

      const register = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email: nutricionista.email, senha: "senha-segura-com-12", nome: nutricionista.nome }
      });
      const get = await app.inject({
        method: "GET",
        url: "/me",
        headers: { cookie: cookieHeader(register) }
      });
      const patch = await app.inject({
        method: "PATCH",
        url: "/me",
        headers: { cookie: cookieHeader(register) },
        payload: { nome: "Novo nome", crn: "CRN-123" }
      });

      expect(get.statusCode).toBe(200);
      expect(get.json().nutricionista.crn).toBe("CRN-123");
      expect(patch.statusCode).toBe(200);
      expect(prisma.nutricionista.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: nutricionista.id },
        data: { nome: "Novo nome", crn: "CRN-123" }
      }));
    });
  });

  it("cadastra nutricionista, cria sessão e define cookies httpOnly", async () => {
    const prisma = createPrismaMock();
    prisma.nutricionista.create.mockResolvedValue(nutricionista);
    prisma.sessao.create.mockResolvedValue(session);
    app = buildApp(prisma);
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "NUTRI@EXAMPLE.COM",
        senha: "senha-segura-com-12",
        nome: nutricionista.nome
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ nutricionista });
    expect(prisma.nutricionista.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ email: "nutri@example.com", senhaHash: expect.any(String) })
    }));
    expect(prisma.sessao.create).toHaveBeenCalledOnce();
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([
      expect.stringContaining("nutri_access="),
      expect.stringContaining("nutri_refresh=")
    ]));
    expect(setCookies(response).every((cookie) => cookie.includes("HttpOnly"))).toBe(true);
  });

  it("rejeita e-mail duplicado e credenciais inválidas", async () => {
    const prisma = createPrismaMock();
    prisma.nutricionista.create.mockRejectedValue({ code: "P2002" });
    prisma.nutricionista.findUnique.mockResolvedValue(null);
    app = buildApp(prisma);
    await app.ready();

    const duplicate = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "nutri@example.com", senha: "senha-segura-com-12", nome: "Outro" }
    });
    const invalidLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "nutri@example.com", senha: "senha-incorreta" }
    });

    expect(duplicate.statusCode).toBe(409);
    expect(duplicate.json().codigo).toBe("EMAIL_JA_CADASTRADO");
    expect(invalidLogin.statusCode).toBe(401);
    expect(invalidLogin.json().codigo).toBe("CREDENCIAIS_INVALIDAS");
  });

  it("faz login com senha válida e logout revoga a sessão", async () => {
    const prisma = createPrismaMock();
    const senhaHash = await argon2.hash("senha-segura-com-12", { type: argon2.argon2id });
    prisma.nutricionista.findUnique.mockResolvedValue({ ...nutricionista, senhaHash });
    prisma.sessao.create.mockResolvedValue(session);
    prisma.sessao.updateMany.mockResolvedValue({ count: 1 });
    app = buildApp(prisma);
    await app.ready();

    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: nutricionista.email, senha: "senha-segura-com-12" }
    });
    const logout = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie: cookieHeader(login) }
    });

    expect(login.statusCode).toBe(200);
    expect(logout.statusCode).toBe(200);
    expect(prisma.sessao.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: session.id, revogadaEm: null })
    }));
  });

  it("rotaciona o refresh token e rejeita a reutilização do token antigo", async () => {
    const prisma = createPrismaMock();
    prisma.nutricionista.create.mockResolvedValue(nutricionista);
    prisma.sessao.create.mockResolvedValue(session);
    prisma.sessao.findFirst.mockResolvedValue(session);
    prisma.sessao.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    app = buildApp(prisma);
    await app.ready();

    const register = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: nutricionista.email, senha: "senha-segura-com-12", nome: nutricionista.nome }
    });
    const oldCookies = cookieHeader(register);
    const rotated = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: { cookie: oldCookies }
    });
    const replay = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: { cookie: oldCookies }
    });

    expect(rotated.statusCode).toBe(200);
    expect(rotated.json()).toEqual({ status: "ok" });
    expect(cookieHeader(rotated)).not.toBe(oldCookies);
    expect(replay.statusCode).toBe(401);
    expect(replay.json().codigo).toBe("SESSAO_INVALIDA");
  });

  it("solicita recuperação sem revelar se o e-mail existe", async () => {
    const prisma = createPrismaMock();
    const sendResetEmail = vi.fn<(email: PasswordResetEmail) => Promise<void>>();
    prisma.nutricionista.findUnique.mockResolvedValue(null);
    app = buildApp(prisma, sendResetEmail);
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "inexistente@example.com" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("ok");
    expect(sendResetEmail).not.toHaveBeenCalled();
  });

  it("envia recuperação, atualiza a senha e invalida o token depois do uso", async () => {
    const prisma = createPrismaMock();
    const sendResetEmail = vi.fn<(email: PasswordResetEmail) => Promise<void>>().mockResolvedValue(undefined);
    const reset = {
      id: "33333333-3333-4333-8333-333333333333",
      nutricionistaId: nutricionista.id
    };
    prisma.nutricionista.findUnique.mockResolvedValue({
      ...nutricionista,
      senhaHash: "unused"
    });
    prisma.resetSenha.findFirst.mockResolvedValue(reset);
    prisma.resetSenha.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    prisma.nutricionista.update.mockResolvedValue(nutricionista);
    prisma.sessao.updateMany.mockResolvedValue({ count: 1 });
    app = buildApp(prisma, sendResetEmail);
    await app.ready();

    const forgot = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: nutricionista.email }
    });
    const token = sendResetEmail.mock.calls[0]?.[0].token;
    const resetResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, novaSenha: "nova-senha-segura" }
    });
    const replay = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, novaSenha: "outra-senha-segura" }
    });

    expect(forgot.statusCode).toBe(200);
    expect(sendResetEmail).toHaveBeenCalledWith({
      to: nutricionista.email,
      token: expect.any(String)
    });
    expect(resetResponse.statusCode).toBe(200);
    expect(prisma.nutricionista.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: nutricionista.id },
      data: { senhaHash: expect.any(String) }
    }));
    expect(prisma.sessao.updateMany).toHaveBeenCalled();
    expect(replay.statusCode).toBe(400);
    expect(replay.json().codigo).toBe("TOKEN_INVALIDO");
  });
});
