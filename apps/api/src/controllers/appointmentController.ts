import type { FastifyReply, FastifyRequest } from "fastify";
import { AppointmentCreateInput, appointmentIdSchema, appointmentUpdateSchema } from "@nutriapp/shared";
import type { AppointmentService } from "../services/appointmentService.js";
import { requireSession } from "../middleware/authenticate.js";

export function createAppointmentController(service: AppointmentService) {
  return {
    list: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);

      const appointment = await service.list(sessionId);
      if (!appointment) return unauthorized(reply);
      return reply.send({ agendamentos: appointment });
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const patientName = (request.body as { paciente?: string }).paciente;
      const patient = patientName ? { success: true, data: patientName } : { success: false, error: "Paciente não informado" };

      const input = AppointmentCreateInput.safeParse(request.body);

      if (!patient.success) return invalidInput(reply, { paciente: "Paciente não informado" });
      if (!input.success) return invalidInput(reply, input.error.flatten());
      console.log("Creating appointment with input:", input.data);
      const result = await service.create(sessionId, input.data);

      if (!result.success) {
        return sendErrorReply(result, reply);
      }

      return reply.status(201).send({ agendamento: result.data });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = appointmentIdSchema.safeParse((request.params as { id?: string }).id);
      const input = appointmentUpdateSchema.safeParse(request.body);

      if (!id.success) return notFound(reply);
      if (!input.success) return invalidInput(reply, input.error.flatten());

      const appointment = await service.update(sessionId, id.data, input.data);
      if (!appointment) return notFound(reply);
      return reply.send({ agendamento: appointment });
    },

    remove: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const id = appointmentIdSchema.safeParse((request.params as { id?: string }).id);

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
function conflict(reply: FastifyReply) {
  return reply.status(409).send({ codigo: "CONFLITO_AGENDAMENTO", mensagem: "Já existe um agendamento para o mesmo horário." });
}
function patientNotFound(reply: FastifyReply) {
  return reply.status(404).send({ codigo: "PACIENTE_NAO_ENCONTRADO", mensagem: "Paciente não encontrado ou não pertence a este nutricionista." });
}

function sendErrorReply(result: { success: false; reason: string }, reply: FastifyReply) {
  switch (result.reason) {
    case "UNAUTHORIZED":
      return unauthorized(reply);
    case "SCHEDULE_CONFLICT":
      return conflict(reply);
    case "PATIENT_NOT_FOUND":
      return patientNotFound(reply);
    default:
      return invalidInput(reply, { erro: "Erro ao criar agendamento" });
  }
}