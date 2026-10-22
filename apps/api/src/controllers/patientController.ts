import type { FastifyReply, FastifyRequest } from "fastify";
import { patientCreateSchema, patientIdSchema, patientUpdateSchema } from "@nutriapp/shared";
import type { PatientService } from "../services/patientService.js";
import { requireSession } from "../middleware/authenticate.js";

export function createPatientController(service: PatientService) {
  return {
    list: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const query = request.query as { q?: string; incluirArquivados?: string };
      const patients = await service.list(sessionId, query.q?.trim(), query.incluirArquivados === "true");
      if (!patients) return unauthorized(reply);

      return reply.send({ pacientes: patients });
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const input = patientCreateSchema.safeParse(request.body);
      if (!input.success) return invalidInput(reply, input.error.flatten());

      const patient = await service.create(sessionId, input.data);
      if (!patient) return unauthorized(reply);

      return reply.status(201).send({ paciente: patient });
    },

    get: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const patientId = patientIdSchema.safeParse((request.params as { id?: string }).id);
      if (!patientId.success) return notFound(reply);

      const patient = await service.get(sessionId, patientId.data);
      if (!patient) return notFound(reply);

      return reply.send({ paciente: patient });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const patientId = patientIdSchema.safeParse((request.params as { id?: string }).id);
      const input = patientUpdateSchema.safeParse(request.body);
      if (!patientId.success) return notFound(reply);
      if (!input.success) return invalidInput(reply, input.error.flatten());

      const patient = await service.update(sessionId, patientId.data, input.data);
      if (!patient) return notFound(reply);
      return reply.send({ paciente: patient });
    },

    archive: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const patientId = patientIdSchema.safeParse((request.params as { id?: string }).id);
      if (!patientId.success) return notFound(reply);

      const archived = await service.archive(sessionId, patientId.data);
      if (!archived) return notFound(reply);
      return reply.send({ status: "ok" });
    }
  };
}

function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({ codigo: "NAO_AUTENTICADO", mensagem: "É necessário estar autenticado." });
}

function notFound(reply: FastifyReply) {
  return reply.status(404).send({ codigo: "PACIENTE_NAO_ENCONTRADO", mensagem: "Paciente não encontrado." });
}

function invalidInput(reply: FastifyReply, detalhes: unknown) {
  return reply.status(400).send({ codigo: "VALIDACAO_INVALIDA", mensagem: "Os dados enviados são inválidos.", detalhes });
}
