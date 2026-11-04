import type { AppointmentCreateInput, AppointmentUpdateInput, CreateAppointmentResult } from "@nutriapp/shared";
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

    async create(sessionId: string, input: AppointmentCreateInput): Promise<CreateAppointmentResult> {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return { success: false, reason: "UNAUTHORIZED" };

      const hasConflict: boolean = await appointments.findConflicts(ownerId, {
        data: input.data,
        horario: input.horario,
        duracao: input.duracao,
      }).then(conflicts => conflicts.length > 0);

      if (hasConflict) return { success: false, reason: "SCHEDULE_CONFLICT" };

      const dataAppointment = {
        pacienteNome: input.paciente,
        contato: input.contato,
        data: input.data,
        horario: input.horario,
        duracao: input.duracao,
        atendimento: input.atendimento,
        tipoConsulta: input.tipoConsulta,
        local: input.local,
        note: input.note,
      };

      // Se informou um paciente, valida o vínculo com o nutricionista
      if (input.pacienteId) {
        const patient = await patients.findPatientOwner(
          ownerId,
          input.pacienteId
        );

        if (!patient) return { success: false, reason: "PATIENT_NOT_FOUND" };

        const appointment = await appointments.createAppointment(ownerId, patient.id, {
          ...dataAppointment,
          pacienteNome: patient.nome,
          contato: patient.contato,
        });

        return { success: true, data: appointment };
      }

      // Sem paciente cadastrado: cria somente o agendamento.
      // O paciente será cadastrado e vinculado antes da consulta ser realizada.
      const appointment = await appointments.createAppointment(ownerId, null, dataAppointment);

      return { success: true, data: appointment };
    },

    async update(
      sessionId: string,
      appointmentId: string,
      input: AppointmentUpdateInput
    ) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;

      const existing = await appointments.findAppointment(ownerId, appointmentId);
      if (!existing) return undefined;

      // Só valida um paciente se o agendamento já tiver um vínculo.
      if (existing.pacienteId) {
        const patient = await patients.findPatientOwner(
          ownerId,
          existing.pacienteId
        );

        if (!patient) return undefined;
      }

      // Valida um novo paciente quando o campo é enviado com UUID.
      if (input.pacienteId) {
        const patient = await patients.findPatientOwner(
          ownerId,
          input.pacienteId
        );

        if (!patient) return undefined;
      }

      const values = {
        data: input.data ?? existing.data,
        horario: input.horario ?? existing.horario,
        duracao: input.duracao ?? existing.duracao,
        atendimento: input.atendimento ?? existing.atendimento,
        tipoConsulta: input.tipoConsulta ?? existing.tipoConsulta,
        local: input.local ?? existing.local,
        note: input.note ?? existing.note,
        status: input.status ?? existing.status,
        ...(input.pacienteId !== undefined
          ? { pacienteId: input.pacienteId }
          : {}),
      };

      return appointments.updateAppointment(
        ownerId,
        appointmentId,
        values
      );
    },

    async remove(sessionId: string, appointmentId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      return ownerId ? appointments.deleteAppointment(ownerId, appointmentId) : null;
    }
  };
}

export type AppointmentService = ReturnType<typeof createAppointmentService>;
