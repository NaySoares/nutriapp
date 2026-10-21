import type { AuthRepository } from "../repositories/authRepository.js";
import type { AppointmentCreateInput, AppointmentUpdateInput } from "@nutriapp/shared";

export function createAppointmentService(repository: AuthRepository) {
  return {
    async list(sessionId: string) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;
      return ownerId ? repository.listAppointments(ownerId) : null;
    },

    async create(sessionId: string, patientId: string, input: AppointmentCreateInput) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;
      const patient = await repository.findPatientOwner(ownerId, patientId);
      if (!patient) return undefined;
      return repository.createAppointment(ownerId, { pacienteId: patientId, ...input });
    },

    async update(sessionId: string, appointmentId: string, input: AppointmentUpdateInput) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;

      const existing = await repository.findAppointment(ownerId, appointmentId);
      if (!existing) return undefined;

      const patient = await repository.findPatientOwner(ownerId, existing.pacienteId);
      if (!patient) return undefined;

      const values = {
        paciente: input.paciente ?? existing.pacienteId,
        data: input.data ?? existing.data,
        horario: input.horario ?? existing.horario,
        duracao: input.duracao ?? existing.duracao,
        atendimento: input.atendimento ?? existing.atendimento,
        tipoConsulta: input.tipoConsulta ?? existing.tipoConsulta,
        local: input.local ?? existing.local,
        note: input.note ?? existing.note,
        status: input.status ?? existing.status,
      } as AppointmentCreateInput;

      return repository.updateAppointment(ownerId, appointmentId, values);
    },
    async remove(sessionId: string, appointmentId: string) {
      const ownerId = await repository.findSessionOwner(sessionId);
      return ownerId ? repository.deleteMeasurement(ownerId, appointmentId) : null;
    }
  };
}

export type AppointmentService = ReturnType<typeof createAppointmentService>;
