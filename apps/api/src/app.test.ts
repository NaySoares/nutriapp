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

const secondNutricionista = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "outro@example.com",
  nome: "Outro Nutricionista"
};

const secondSession = {
  id: "66666666-6666-4666-8666-666666666666",
  nutricionistaId: secondNutricionista.id
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
    },
    paciente: {
      create: vi.fn<AuthPrisma["paciente"]["create"]>(),
      findMany: vi.fn<AuthPrisma["paciente"]["findMany"]>(),
      findFirst: vi.fn<AuthPrisma["paciente"]["findFirst"]>(),
      updateMany: vi.fn<AuthPrisma["paciente"]["updateMany"]>()
    },
    medicao: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
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
      expect(prisma.sessao.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: session.id, revogadaEm: null, expiraEm: expect.any(Object) })
      }));
      expect(patch.statusCode).toBe(200);
      expect(prisma.nutricionista.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: nutricionista.id },
        data: { nome: "Novo nome", crn: "CRN-123" }
      }));
    });
  });

  describe("pacientes", () => {
    let app: FastifyInstance;

    afterEach(async () => {
      await app?.close();
    });

    describe("medições", () => {
      let app: FastifyInstance;

      afterEach(async () => {
        await app?.close();
      });

      it("cria, lista, atualiza e remove medição com snapshot calculado", async () => {
        const prisma = createPrismaMock();
        const patientId = "88888888-8888-4888-8888-888888888888";
        const measurementId = "99999999-9999-4999-8999-999999999999";
        const measurement = {
          id: measurementId,
          pacienteId: patientId,
          data: new Date("2026-01-01T00:00:00.000Z"),
          pesoKg: 80,
          alturaCm: 180,
          circunferencias: null,
          nivelAtividade: "moderado",
          tmbKcal: 1780,
          getKcal: 2759,
          imc: 24.691358,
          formulaUsada: "mifflin" as const,
          fatorUsado: 1.55,
          criadoEm: new Date("2026-01-01T00:00:00.000Z"),
          atualizadoEm: new Date("2026-01-01T00:00:00.000Z")
        };
        prisma.nutricionista.findUnique.mockImplementation(async () => ({
          id: nutricionista.id,
          email: nutricionista.email,
          nome: nutricionista.nome,
          senhaHash: "unused",
          formulaPadrao: "mifflin",
          fatoresAtividade: { moderado: 1.55 }
        } as never));
        prisma.sessao.findUnique.mockResolvedValue({ nutricionistaId: nutricionista.id });
        prisma.paciente.findFirst.mockResolvedValue({
          id: patientId,
          nutricionistaId: nutricionista.id,
          nome: "Paciente",
          dataNascimento: new Date("1995-01-01T00:00:00.000Z"),
          sexo: "M",
          contato: null,
          anamnese: null,
          arquivadoEm: null,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        });
        prisma.medicao.create.mockResolvedValue(measurement);
        prisma.medicao.findMany.mockResolvedValue([measurement]);
        prisma.medicao.findFirst.mockResolvedValue(measurement);
        prisma.medicao.update.mockResolvedValue({ ...measurement, pesoKg: 81 });
        prisma.medicao.delete.mockResolvedValue(measurement);
        app = buildApp(prisma);
        await app.ready();
        const cookies = cookieHeader(await loginWithMock(app, prisma));

        const created = await app.inject({
          method: "POST",
          url: `/patients/${patientId}/measurements`,
          headers: { cookie: cookies },
          payload: {
            data: "2026-01-01",
            pesoKg: 80,
            alturaCm: 180,
            nivelAtividade: "moderado"
          }
        });
        const listed = await app.inject({
          method: "GET",
          url: `/patients/${patientId}/measurements`,
          headers: { cookie: cookies }
        });
        const updated = await app.inject({
          method: "PATCH",
          url: `/measurements/${measurementId}`,
          headers: { cookie: cookies },
          payload: { pesoKg: 81 }
        });
        const removed = await app.inject({
          method: "DELETE",
          url: `/measurements/${measurementId}`,
          headers: { cookie: cookies }
        });

        expect(created.statusCode).toBe(201);
        expect(prisma.medicao.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            pacienteId: patientId,
            tmbKcal: 1775,
            getKcal: 2751.25,
            formulaUsada: "mifflin",
            fatorUsado: 1.55
          })
        }));
        expect(listed.statusCode).toBe(200);
        expect(updated.statusCode).toBe(200);
        expect(removed.statusCode).toBe(200);
        expect(prisma.medicao.delete).toHaveBeenCalledWith({ where: { id: measurementId } });
      });
    });

    it("exige autenticação para acessar pacientes", async () => {
      const prisma = createPrismaMock();
      app = buildApp(prisma);
      await app.ready();

      const response = await app.inject({ method: "GET", url: "/patients" });

      expect(response.statusCode).toBe(401);
      expect(prisma.paciente.findMany).not.toHaveBeenCalled();
    });

    it("cria, lista, atualiza e arquiva paciente sem apagar a anamnese", async () => {
      const prisma = createPrismaMock();
      const patient = {
        id: "44444444-4444-4444-8444-444444444444",
        nutricionistaId: nutricionista.id,
        nome: "Maria da Silva",
        dataNascimento: new Date("1990-05-10T00:00:00.000Z"),
        sexo: "F" as const,
        contato: "maria@example.com",
        anamnese: "Relata rotina sedentária.",
        arquivadoEm: null,
        criadoEm: new Date("2026-01-01T00:00:00.000Z"),
        atualizadoEm: new Date("2026-01-01T00:00:00.000Z")
      };
      prisma.sessao.findUnique.mockResolvedValue({ nutricionistaId: nutricionista.id });
      prisma.paciente.create.mockResolvedValue(patient);
      prisma.paciente.findMany.mockResolvedValue([patient]);
      prisma.paciente.findFirst.mockResolvedValue({ ...patient, nome: "Maria Atualizada" });
      prisma.paciente.updateMany.mockResolvedValue({ count: 1 });
      app = buildApp(prisma);
      await app.ready();
      const cookies = cookieHeader(await loginWithMock(app, prisma));

      const created = await app.inject({
        method: "POST",
        url: "/patients",
        headers: { cookie: cookies },
        payload: {
          nome: patient.nome,
          dataNascimento: "1990-05-10",
          sexo: "F",
          contato: patient.contato,
          anamnese: patient.anamnese
        }
      });
      const listed = await app.inject({ method: "GET", url: "/patients?q=Maria", headers: { cookie: cookies } });
      const updated = await app.inject({
        method: "PATCH",
        url: `/patients/${patient.id}`,
        headers: { cookie: cookies },
        payload: { nome: "Maria Atualizada", anamnese: patient.anamnese }
      });
      const archived = await app.inject({
        method: "POST",
        url: `/patients/${patient.id}/archive`,
        headers: { cookie: cookies }
      });

      expect(created.statusCode).toBe(201);
      expect(prisma.paciente.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ nutricionistaId: nutricionista.id, dataNascimento: expect.any(Date) })
      }));
      expect(listed.statusCode).toBe(200);
      expect(prisma.paciente.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          nutricionistaId: nutricionista.id,
          arquivadoEm: null,
          nome: { contains: "Maria", mode: "insensitive" }
        })
      }));
      expect(updated.statusCode).toBe(200);
      expect(archived.statusCode).toBe(200);
      expect(prisma.paciente.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: patient.id, nutricionistaId: nutricionista.id, arquivadoEm: null }
      }));
    });

    it("não acessa paciente pertencente a outro nutricionista", async () => {
      const prisma = createPrismaMock();
      prisma.sessao.findUnique.mockResolvedValue({ nutricionistaId: nutricionista.id });
      prisma.paciente.findFirst.mockResolvedValue(null);
      app = buildApp(prisma);
      await app.ready();
      const cookies = cookieHeader(await loginWithMock(app, prisma));

      const response = await app.inject({
        method: "GET",
        url: "/patients/55555555-5555-4555-8555-555555555555",
        headers: { cookie: cookies }
      });

      expect(response.statusCode).toBe(404);
      expect(prisma.paciente.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          id: "55555555-5555-4555-8555-555555555555",
          nutricionistaId: nutricionista.id
        }
      }));
    });

    it("isola pacientes entre dois nutricionistas em todas as operações", async () => {
      const prisma = createPrismaMock();
      const patient = {
        id: "77777777-7777-4777-8777-777777777777",
        nutricionistaId: nutricionista.id,
        nome: "Paciente da primeira nutricionista",
        dataNascimento: new Date("1990-05-10T00:00:00.000Z"),
        sexo: "F" as const,
        contato: null,
        anamnese: "Dados privados.",
        arquivadoEm: null,
        criadoEm: new Date("2026-01-01T00:00:00.000Z"),
        atualizadoEm: new Date("2026-01-01T00:00:00.000Z")
      };

      prisma.nutricionista.create.mockResolvedValueOnce(nutricionista).mockResolvedValueOnce(secondNutricionista);
      prisma.sessao.create.mockResolvedValueOnce(session).mockResolvedValueOnce(secondSession);
      prisma.sessao.findUnique.mockImplementation(async ({ where }) => {
        const owners = {
          [session.id]: { nutricionistaId: nutricionista.id },
          [secondSession.id]: { nutricionistaId: secondNutricionista.id }
        };
        return owners[where.id as keyof typeof owners] ?? null;
      });
      prisma.paciente.findMany.mockImplementation(async ({ where }) => (
        where.nutricionistaId === nutricionista.id ? [patient] : []
      ));
      prisma.paciente.findFirst.mockImplementation(async ({ where }) => (
        where.nutricionistaId === nutricionista.id ? patient : null
      ));
      prisma.paciente.updateMany.mockImplementation(async ({ where }) => ({
        count: where.nutricionistaId === nutricionista.id ? 1 : 0
      }));
      app = buildApp(prisma);
      await app.ready();

      const firstCookies = cookieHeader(await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email: nutricionista.email, senha: "senha-segura-com-12", nome: nutricionista.nome }
      }));
      const secondCookies = cookieHeader(await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email: secondNutricionista.email, senha: "senha-segura-com-12", nome: secondNutricionista.nome }
      }));

      const firstList = await app.inject({ method: "GET", url: "/patients", headers: { cookie: firstCookies } });
      const secondList = await app.inject({ method: "GET", url: "/patients", headers: { cookie: secondCookies } });
      const secondGet = await app.inject({
        method: "GET",
        url: `/patients/${patient.id}`,
        headers: { cookie: secondCookies }
      });
      const secondUpdate = await app.inject({
        method: "PATCH",
        url: `/patients/${patient.id}`,
        headers: { cookie: secondCookies },
        payload: { nome: "Tentativa de acesso" }
      });
      const secondArchive = await app.inject({
        method: "POST",
        url: `/patients/${patient.id}/archive`,
        headers: { cookie: secondCookies }
      });

      expect(firstList.statusCode).toBe(200);
      expect(firstList.json().pacientes).toEqual([{
        ...patient,
        dataNascimento: patient.dataNascimento.toISOString(),
        criadoEm: patient.criadoEm.toISOString(),
        atualizadoEm: patient.atualizadoEm.toISOString()
      }]);
      expect(secondList.statusCode).toBe(200);
      expect(secondList.json().pacientes).toEqual([]);
      expect(secondGet.statusCode).toBe(404);
      expect(secondUpdate.statusCode).toBe(404);
      expect(secondArchive.statusCode).toBe(404);
      expect(prisma.paciente.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ nutricionistaId: secondNutricionista.id })
      }));
      expect(prisma.paciente.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: patient.id, nutricionistaId: secondNutricionista.id }
      }));
      expect(prisma.paciente.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: patient.id, nutricionistaId: secondNutricionista.id, arquivadoEm: null }
      }));
    });
  });

  async function loginWithMock(app: FastifyInstance, prisma: ReturnType<typeof createPrismaMock>) {
    prisma.nutricionista.create.mockResolvedValue(nutricionista);
    prisma.sessao.create.mockResolvedValue(session);
    return app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: nutricionista.email, senha: "senha-segura-com-12", nome: nutricionista.nome }
    });
  }

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
