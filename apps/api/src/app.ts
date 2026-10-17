import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { apiErrorSchema } from "@nutriapp/shared";
import { sendPasswordResetEmail, type PasswordResetEmail } from "./email.js";
import { createAuthController } from "./controllers/authController.js";
import { createAuthRepository } from "./repositories/authRepository.js";
import { createAuthService } from "./services/authService.js";
import { createProfileController } from "./controllers/profileController.js";
import { createS3LogoStorage, createProfileService } from "./services/profileService.js";
import { createPatientController } from "./controllers/patientController.js";
import { createPatientService } from "./services/patientService.js";
import type { AuthPrisma } from "./types/auth.js";

export type { AuthPrisma } from "./types/auth.js";

const healthResponseSchema = z.object({ status: z.literal("ok"), service: z.literal("api") });

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
  void app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

  const auth = createAuthController(createAuthService(createAuthRepository(prisma), sendResetEmail));
  const repository = createAuthRepository(prisma);
  const profile = createProfileController(createProfileService(repository, createS3LogoStorage()));
  const patients = createPatientController(createPatientService(repository));
  app.get("/health", async () => healthResponseSchema.parse({ status: "ok", service: "api" }));
  app.post("/auth/register", auth.register);
  app.post("/auth/login", auth.login);
  app.post("/auth/forgot-password", auth.forgotPassword);
  app.post("/auth/reset-password", auth.resetPassword);
  app.post("/auth/refresh", auth.refresh);
  app.post("/auth/logout", auth.logout);
  app.get("/me", profile.get);
  app.patch("/me", profile.update);
  app.post("/me/logo", profile.uploadLogo);
  app.get("/patients", patients.list);
  app.post("/patients", patients.create);
  app.get("/patients/:id", patients.get);
  app.patch("/patients/:id", patients.update);
  app.post("/patients/:id/archive", patients.archive);

  app.setErrorHandler((error, request, reply) => {
    const details = error as { validation?: unknown; statusCode?: number; message?: string };
    request.log.error(error);
    return reply.status(details.validation ? 400 : details.statusCode ?? 500).send(apiErrorSchema.parse({
      codigo: details.validation ? "VALIDACAO_INVALIDA" : details.statusCode ? "REQUISICAO_INVALIDA" : "ERRO_INTERNO",
      mensagem: details.validation ? "Os dados enviados são inválidos." : details.statusCode ? details.message ?? "Requisição inválida." : "Ocorreu um erro interno.",
      ...(details.validation ? { detalhes: details.validation } : {})
    }));
  });
  return app;
}
