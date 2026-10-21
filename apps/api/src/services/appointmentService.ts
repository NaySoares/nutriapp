import type { AuthRepository } from "../repositories/authRepository.js";
import type { AppointmentCreateInput, AppointmentUpdateInput, } from "@nutriapp/shared";

export function createAppointmentService(repository: AuthRepository) {
  return {
    async list(sessionId: string) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;
      return ownerId ? repository.listAppointments(ownerId) : null;
    },

    async create(sessionId: string, input: AppointmentCreateInput) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;
      const patientId = input.pacienteId;

      const dataAppointment = {
        pacienteNome: input.paciente,
        data: input.data,
        horario: input.horario,
        duracao: input.duracao,
        atendimento: input.atendimento,
        tipoConsulta: input.tipoConsulta,
        local: input.local,
        note: input?.note,
      }

      // se não tem ID é um paciente novo
      if (patientId === undefined) {
        const newPatient = await repository.createPatient(ownerId, {
          nome: input.paciente,
          dataNascimento: new Date(),
          sexo: "M",
          contato: input.contato,
        });

        if (!newPatient) return undefined;

        const patient = await repository.findPatientOwner(ownerId, newPatient.id);
        if (!patient) return undefined;

        return repository.createAppointment(ownerId, newPatient.id, { ...dataAppointment });
      }

      if (typeof patientId !== "string") {
        return undefined;
      }

      const patient = await repository.findPatientOwner(ownerId, input.pacienteId as string);
      if (!patient) return undefined;
      return repository.createAppointment(ownerId, patient.id, { ...dataAppointment });
    },

    async update(sessionId: string, appointmentId: string, input: AppointmentUpdateInput) {
      const ownerId = await repository.findSessionOwner(sessionId);
      if (!ownerId) return null;

      const existing = await repository.findAppointment(ownerId, appointmentId);
      if (!existing) return undefined;

      const patient = await repository.findPatientOwner(ownerId, existing.pacienteId);
      if (!patient) return undefined;

      const values = {
        data: input.data ?? existing.data,
        horario: input.horario ?? existing.horario,
        duracao: input.duracao ?? existing.duracao,
        atendimento: input.atendimento ?? existing.atendimento,
        tipoConsulta: input.tipoConsulta ?? existing.tipoConsulta,
        local: input.local ?? existing.local,
        note: input.note ?? existing.note,
        status: input.status ?? existing.status,
      } as AppointmentUpdateInput;

      return repository.updateAppointment(ownerId, appointmentId, values);
    },
    async remove(sessionId: string, appointmentId: string) {
      const ownerId = await repository.findSessionOwner(sessionId);
      return ownerId ? repository.deleteMeasurement(ownerId, appointmentId) : null;
    }
  };
}

export type AppointmentService = ReturnType<typeof createAppointmentService>;
