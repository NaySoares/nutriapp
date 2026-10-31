import type { FastifyReply, FastifyRequest } from "fastify";
import { foodIdSchema, foodUpdateSchema, foodCreateSchema } from "@nutriapp/shared";
import { requireSession } from "../middleware/authenticate.js";
import type { FoodService } from "../services/foodService.js";
import { FoodFilters } from "../repositories/foodRepository.js";
import { FonteAlimento } from "@prisma/client/wasm";

export function createFoodController(service: FoodService) {
  return {
    list: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const filters = toFilter(request.query)
      const foods = await service.list(sessionId, filters);

      if (!foods) return unauthorized(reply);
      return reply.send({ alimentos: foods });
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const input = foodCreateSchema.safeParse(request.body);

      if (!input.success) return invalidInput(reply, input.error.flatten());

      const food = await service.create(sessionId, input.data);

      if (!food) return unauthorized(reply);
      if (food === undefined) return notFound(reply);

      return reply.status(201).send({ alimento: food });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = foodIdSchema.safeParse((request.params as { id?: string }).id);
      const input = foodUpdateSchema.safeParse(request.body);

      if (!id.success) return notFound(reply);
      if (!input.success) return invalidInput(reply, input.error.flatten());

      const food = await service.update(sessionId, id.data, input.data);
      if (!food) return notFound(reply);
      return reply.send({ alimento: food });
    },

    remove: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = foodIdSchema.safeParse((request.params as { id?: string }).id);

      if (!id.success) return notFound(reply);
      const removed = await service.remove(sessionId, id.data);
      if (!removed) return notFound(reply);
      return reply.send({ status: "ok" });
    }
  };
}

function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({ codigo: "NAO_AUTENTICADO", mensagem: "É necessário estar autenticado." });
}
function notFound(reply: FastifyReply) {
  return reply.status(404).send({ codigo: "AGENDAMENTO_NAO_ENCONTRADO", mensagem: "Agendamento não encontrado." });
}
function invalidInput(reply: FastifyReply, detalhes: unknown) {
  return reply.status(400).send({ codigo: "VALIDACAO_INVALIDA", mensagem: "Os dados enviados são inválidos.", detalhes });
}

function toFilter(filters: unknown): FoodFilters {
  if (!filters || typeof filters !== "object") return {};
  const f = filters as Record<string, unknown>;
  const result: FoodFilters = {};
  if (typeof f.q === "string") result.q = f.q;
  if (typeof f.fonte === "string") result.fonte = f.fonte as FonteAlimento;
  if (typeof f.grupo === "string") result.grupo = f.grupo;
  if (typeof f.page === "string" && !isNaN(parseInt(f.page))) result.page = parseInt(f.page);
  if (typeof f.pageSize === "string" && !isNaN(parseInt(f.pageSize))) result.pageSize = parseInt(f.pageSize);
  return result;
}