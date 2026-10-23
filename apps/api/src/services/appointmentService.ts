import type { AppointmentCreateInput, AppointmentUpdateInput, } from "@nutriapp/shared";
import { SessionRepository } from "../repositories/sessionRepository.js";
import { PatientRepository } from "../repositories/patientRepository.js";
import { AppointmentRepository } from "../repositories/appointmentRepository.js";

type AppointmentServiceDependencies = {
  sessions: SessionRepository;
  appointments: AppointmentRepository;
  patients: PatientRepository;
};

export function createAppointmentService({sessions, appointments, patients}: AppointmentServiceDependencies) {
  return {
    async list(sessionId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;
      return ownerId ? appointments.listAppointments(ownerId) : null;
    },

    async create(sessionId: string, input: AppointmentCreateInput) {
      const ownerId = await sessions.findSessionOwner(sessionId);
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
        const newPatient = await patients.createPatient(ownerId, {
          nome: input.paciente,
          dataNascimento: new Date(),
          sexo: "M",
          contato: input.contato,
        });

        if (!newPatient) return undefined;

        const patient = await patients.findPatientOwner(ownerId, newPatient.id);
        if (!patient) return undefined;

        return appointments.createAppointment(ownerId, newPatient.id, { ...dataAppointment });
      }

      if (typeof patientId !== "string") {
        return undefined;
      }

      const patient = await patients.findPatientOwner(ownerId, input.pacienteId as string);
      if (!patient) return undefined;
      return appointments.createAppointment(ownerId, patient.id, { ...dataAppointment });
    },

    async update(sessionId: string, appointmentId: string, input: AppointmentUpdateInput) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;

      const existing = await appointments.findAppointment(ownerId, appointmentId);
      if (!existing) return undefined;

      const patient = await patients.findPatientOwner(ownerId, existing.pacienteId);
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

      return appointments.updateAppointment(ownerId, appointmentId, values);
    },
    async remove(sessionId: string, appointmentId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      return ownerId ? appointments.deleteAppointment(ownerId, appointmentId) : null;
    }
  };
}

export type AppointmentService = ReturnType<typeof createAppointmentService>;
