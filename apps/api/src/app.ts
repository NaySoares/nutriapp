import Fastify, { type FastifyInstance } from "fastify";
import sensible from "@fastify/sensible";
import { z } from "zod";
import { apiErrorSchema } from "@nutriapp/shared";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("api")
});

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      transport: process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined
    }
  });

  void app.register(sensible);

  app.get("/health", async () => healthResponseSchema.parse({ status: "ok", service: "api" }));

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
