import type { FastifyReply, FastifyRequest } from "fastify";
import { measurementCreateSchema, measurementIdSchema, measurementUpdateSchema, patientIdSchema } from "@nutriapp/shared";
import type { MeasurementService } from "../services/measurementService.js";
import { requireSession } from "../middleware/authenticate.js";

export function createMeasurementController(service: MeasurementService) {
  return {
    list: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const patient = patientIdSchema.safeParse((request.params as { id?: string }).id);
      if (!patient.success) return notFound(reply);

      const measurements = await service.list(sessionId, patient.data);
      if (!measurements) return unauthorized(reply);
      return reply.send({ medicoes: measurements });
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const patient = patientIdSchema.safeParse((request.params as { id?: string }).id);
      const input = measurementCreateSchema.safeParse(request.body);

      if (!patient.success) return notFound(reply);
      if (!input.success) return invalidInput(reply, input.error.flatten());
      const measurement = await service.create(sessionId, patient.data, input.data);

      if (!measurement) return unauthorized(reply);
      if (measurement === undefined) return notFound(reply);
      return reply.status(201).send({ medicao: measurement });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = measurementIdSchema.safeParse((request.params as { id?: string }).id);
      const input = measurementUpdateSchema.safeParse(request.body);

      if (!id.success) return notFound(reply);
      if (!input.success) return invalidInput(reply, input.error.flatten());
      const measurement = await service.update(sessionId, id.data, input.data);
      if (!measurement) return notFound(reply);
      return reply.send({ medicao: measurement });
    },

    remove: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = measurementIdSchema.safeParse((request.params as { id?: string }).id);

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
  return reply.status(404).send({ codigo: "MEDICAO_NAO_ENCONTRADA", mensagem: "Medição não encontrada." });
}
function invalidInput(reply: FastifyReply, detalhes: unknown) {
  return reply.status(400).send({ codigo: "VALIDACAO_INVALIDA", mensagem: "Os dados enviados são inválidos.", detalhes });
}
