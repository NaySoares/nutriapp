import type { FastifyReply, FastifyRequest } from "fastify";
import { AppointmentCreateInput, appointmentIdSchema, appointmentUpdateSchema } from "@nutriapp/shared";
import { ACCESS_COOKIE, readAccessToken } from "./authController.js";
import type { AppointmentService } from "../services/appointmentService.js";

export function createAppointmentController(service: AppointmentService) {
  return {
    list: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = authenticatedSession(request);
      if (!session) return unauthorized(reply);

      const appointment = await service.list(session);
      if (!appointment) return unauthorized(reply);
      return reply.send({ agendamentos: appointment });
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = authenticatedSession(request);
      const patientName = (request.body as { paciente?: string }).paciente;
      const patient = patientName ? { success: true, data: patientName } : { success: false, error: "Paciente não informado" };

      const input = AppointmentCreateInput.safeParse(request.body);

      if (!session) return unauthorized(reply);
      if (!patient.success) return invalidInput(reply, { paciente: "Paciente não informado" });
      if (!input.success) return invalidInput(reply, input.error.flatten());

      const appointment = await service.create(session, input.data);

      if (!appointment) return unauthorized(reply);
      if (appointment === undefined) return notFound(reply);

      return reply.status(201).send({ agendamento: appointment });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = authenticatedSession(request);
      const id = appointmentIdSchema.safeParse((request.params as { id?: string }).id);
      const input = appointmentUpdateSchema.safeParse(request.body);

      if (!session) return unauthorized(reply);
      if (!id.success) return notFound(reply);
      if (!input.success) return invalidInput(reply, input.error.flatten());

      const appointment = await service.update(session, id.data, input.data);
      if (!appointment) return notFound(reply);
      return reply.send({ agendamento: appointment });
    },

    remove: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = authenticatedSession(request);
      const id = appointmentIdSchema.safeParse((request.params as { id?: string }).id);
      if (!session) return unauthorized(reply);
      if (!id.success) return notFound(reply);
      const removed = await service.remove(session, id.data);
      if (!removed) return notFound(reply);
      return reply.send({ status: "ok" });
    }
  };
}

function authenticatedSession(request: FastifyRequest) {
  return readAccessToken(request.cookies[ACCESS_COOKIE]);
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
