import type { FastifyReply, FastifyRequest } from "fastify";
import { mealIdSchema , TYPE_MEAL, TypeMeal, MealCreateSchema, MealUpdateSchema } from "@nutriapp/shared";
import { requireSession } from "../middleware/authenticate.js";
import { MealService, MealFilters } from "../services/mealService.js";

export function createMealController(service: MealService) {
  return {
    list: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const filters = toFilter(request.query)
      const result = await service.list(sessionId, filters);

      if (!result.success) return sendErrorReply(result, reply);

      return reply.send({ refeicoes: result.data });
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const input = MealCreateSchema.safeParse(request.body);

      if (!input.success) return sendErrorReply({ success: false, reason: "INVALID_INPUT" }, reply);

      const result = await service.create(sessionId, input.data);

      if (!result.success) return sendErrorReply(result, reply);

      return reply.status(201).send({ refeicoes: result.data });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = mealIdSchema.safeParse((request.params as { id?: string }).id);
      const input = MealUpdateSchema.safeParse(request.body);

      if (!id.success) return notFound(reply);
      if (!input.success) return sendErrorReply({ success: false, reason: "INVALID_INPUT" }, reply);

      const result = await service.update(sessionId, id.data, input.data);
      if (!result.success) return notFound(reply);

      return reply.send({ refeicoes: result.data });
    },

    remove: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = mealIdSchema.safeParse((request.params as { id?: string }).id);

      if (!id.success) return notFound(reply);

      const result = await service.remove(sessionId, id.data);
      if (!result.success) return notFound(reply);

      return reply.send({ status: "ok" });
    }
  };
}

function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({ codigo: "NAO_AUTENTICADO", mensagem: "É necessário estar autenticado." });
}
function notFound(reply: FastifyReply) {
  return reply.status(404).send({ codigo: "REFEICAO_NAO_ENCONTRADA", mensagem: "Refeição não encontrada." });
}
function invalidInput(reply: FastifyReply, detalhes: unknown) {
  return reply.status(400).send({ codigo: "DADOS_INVALIDOS", mensagem: "Os dados enviados são inválidos.", detalhes });
}
function unknownError(reply: FastifyReply) {
  return reply.status(500).send({ codigo: "ERRO_DESCONHECIDO", mensagem: "Ocorreu um erro desconhecido." });
}

function toFilter(filters: unknown): MealFilters {
  if (!filters || typeof filters !== "object") return {};
  const f = filters as Record<string, unknown>;
  const result: MealFilters = {};
  if (typeof f.q === "string") result.q = f.q;
  if (typeof f.tipo === "string" && Object.values(TYPE_MEAL).includes(f.tipo as TypeMeal)) result.tipo = f.tipo as TypeMeal;
  if (typeof f.page === "string" && !isNaN(parseInt(f.page))) result.page = parseInt(f.page);
  if (typeof f.pageSize === "string" && !isNaN(parseInt(f.pageSize))) result.pageSize = parseInt(f.pageSize);
  return result;
}

function sendErrorReply(result: { success: false; reason: string }, reply: FastifyReply) {
  switch (result.reason) {
    case "UNAUTHORIZED":
      return unauthorized(reply);
    case "NOT_FOUND":
      return notFound(reply);
    case "INVALID_INPUT":
      return invalidInput(reply, { erro: "Dados inválidos" });
    default:
      return unknownError(reply);
  }
}