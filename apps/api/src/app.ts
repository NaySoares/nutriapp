import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { apiErrorSchema, healthResponseSchema } from "@nutriapp/shared";
import { sendPasswordResetEmail, type PasswordResetEmail } from "./email.js";
import { createAuthController } from "./controllers/authController.js";
import { createAuthService } from "./services/authService.js";
import { createProfileController } from "./controllers/profileController.js";
import { createS3LogoStorage, createProfileService } from "./services/profileService.js";
import { createPatientController } from "./controllers/patientController.js";
import { createPatientService } from "./services/patientService.js";
import { createMeasurementController } from "./controllers/measurementController.js";
import { createMeasurementService } from "./services/measurementService.js";
import { createAppointmentService } from "./services/appointmentService.js";
import { createAppointmentController } from "./controllers/appointmentController.js";
import { createFoodService } from "./services/foodService.js";
import { createFoodController } from "./controllers/foodController.js";
import { authenticate } from "./middleware/authenticate.js";
import { createRepositories } from "./repositories/index.js";

export function buildApp(
  prisma = new PrismaClient(),
  sendResetEmail: (email: PasswordResetEmail) => Promise<void> = sendPasswordResetEmail
): FastifyInstance {
  const app = Fastify({
    logger: {
      transport: process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined
    }
  });
  app.decorateRequest("authSession", null);

  void app.register(sensible);
  void app.register(cookie);
  void app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

  const repositories = createRepositories(prisma);

  const auth = createAuthController(createAuthService({
    nutritionists: repositories.nutritionists,
    sessions: repositories.sessions,
    passwordResets: repositories.passwordResets,
  }, sendResetEmail));
  const profile = createProfileController(createProfileService({
    sessions: repositories.sessions,
    nutritionists: repositories.nutritionists,
    settings: repositories.settings
  }, createS3LogoStorage()));
  const patients = createPatientController(createPatientService({
    sessions: repositories.sessions,
    patients: repositories.patients,
  }));
  const measurements = createMeasurementController(createMeasurementService({
    sessions: repositories.sessions,
    measurements: repositories.measurements,
    patients: repositories.patients,
    settings: repositories.settings,
  }));
  const appointments = createAppointmentController(createAppointmentService({
    sessions: repositories.sessions,
    appointments: repositories.appointments,
    patients: repositories.patients,
  }));
  const foods = createFoodController(createFoodService({
    sessions: repositories.sessions,
    foods: repositories.foods,
  }));

  // Rotas Públicas
  app.get("/health", async () => healthResponseSchema.parse({ status: "ok", service: "api" }));

  app.post("/auth/register", auth.register);
  app.post("/auth/login", auth.login);
  app.post("/auth/forgot-password", auth.forgotPassword);
  app.post("/auth/reset-password", auth.resetPassword);
  app.post("/auth/refresh", auth.refresh);
  app.post("/auth/logout", auth.logout);

  // Rotas Privadas
  app.register(async (privateApp) => {
    privateApp.addHook("preHandler", authenticate);

    privateApp.get("/me", profile.get);
    privateApp.patch("/me", profile.update);
    privateApp.post("/me/logo", profile.uploadLogo);
    privateApp.get("/me/settings", profile.getSettings);
    privateApp.patch("/me/settings", profile.updateSettings);

    privateApp.get("/patients", patients.list);
    privateApp.post("/patients", patients.create);
    privateApp.get("/patients/:id", patients.get);
    privateApp.patch("/patients/:id", patients.update);
    privateApp.post("/patients/:id/archive", patients.archive);
    privateApp.get("/patients/:id/measurements", measurements.list);
    privateApp.post("/patients/:id/measurements", measurements.create);

    privateApp.patch("/measurements/:id", measurements.update);
    privateApp.delete("/measurements/:id", measurements.remove);

    privateApp.get("/appointments", appointments.list);
    privateApp.post("/appointments", appointments.create);
    privateApp.patch("/appointments/:id", appointments.update);

    privateApp.get("/foods", foods.list);
  });


  app.setErrorHandler((error, request, reply) => {
    const details = error as { validation?: unknown; statusCode?: number; message?: string };

    request.log.error(error);

    return (
      reply.status(details.validation
        ? 400
        : details.statusCode ?? 500)
        .send(apiErrorSchema.parse({
          codigo: details.validation
            ? "VALIDACAO_INVALIDA"
            : details.statusCode
            ? "REQUISICAO_INVALIDA"
            : "ERRO_INTERNO",
          mensagem: details.validation
            ? "Os dados enviados são inválidos."
            : details.statusCode
            ? details.message
            ?? "Requisição inválida."
            : "Ocorreu um erro interno.",
          ...(details.validation ? { detalhes: details.validation } : {})
      }))
    );
  });

  return app;
}
