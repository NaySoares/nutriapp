import type { PrismaClient } from "@prisma/client";
import { AppointmentCreate, AppointmentRecord, AppointmentStatus, AppointmentUpdate } from "@nutriapp/shared";

type AppointmentSelect = { [K in keyof AppointmentRecord]: true };
type Db = Pick<PrismaClient, "agendamento">;

export type AppointmentFilters = {
  from?: string; // YYYY-MM-DD, inclusivo
  to?: string; // YYYY-MM-DD, inclusivo
  status?: AppointmentStatus;
};

type AppointmentSlot = Pick<AppointmentCreate, "data" | "horario" | "duracao">;

export type AppointmentRepository = {
  createAppointment: (nutritionistId: string, patientId: string, data: AppointmentCreate) => Promise<AppointmentRecord>;
  listAppointments: (nutritionistId: string, filters?: AppointmentFilters) => Promise<AppointmentRecord[]>;
  findAppointment: (nutritionistId: string, appointmentId: string) => Promise<AppointmentRecord | null>;
  updateAppointment: (
    nutritionistId: string,
    appointmentId: string,
    data: AppointmentUpdate
  ) => Promise<AppointmentRecord | null>;
  deleteAppointment: (nutritionistId: string, appointmentId: string) => Promise<boolean>;
  /** Agendamentos ativos que se sobrepõem ao horário informado (ignora cancelados). */
  findConflicts: (
    nutritionistId: string,
    slot: AppointmentSlot,
    excludeAppointmentId?: string
  ) => Promise<AppointmentRecord[]>;
};

type AppointmentClient = {
  agendamento: {
    create: (args: { data: Record<string, unknown>; select: AppointmentSelect }) => Promise<AppointmentRecord>;
    findMany: (args: {
      where: Record<string, unknown>;
      orderBy: Array<Record<string, "asc" | "desc">>;
      select: AppointmentSelect;
    }) => Promise<AppointmentRecord[]>;
    findFirst: (args: { where: Record<string, unknown>; select: AppointmentSelect }) => Promise<AppointmentRecord | null>;
    updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>;
    deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
  };
};

const appointmentSelect: AppointmentSelect = {
  id: true,
  nutricionistaId: true,
  pacienteId: true,
  pacienteNome: true,
  data: true,
  horario: true,
  duracao: true,
  atendimento: true,
  tipoConsulta: true,
  local: true,
  note: true,
  status: true,
  criadoEm: true,
  atualizadoEm: true,
};

const INITIAL_STATUS: AppointmentStatus = "Aguardando confirmação";

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export function createAppointmentRepository(prisma: Db): AppointmentRepository {
  const client = prisma as unknown as AppointmentClient;

  const findAppointment: AppointmentRepository["findAppointment"] = (nutritionistId, appointmentId) =>
    client.agendamento.findFirst({
      where: { id: appointmentId, nutricionistaId: nutritionistId },
      select: appointmentSelect,
    });

  return {
    createAppointment: (nutritionistId, patientId, data) =>
      client.agendamento.create({
        data: {
          ...data,
          data: new Date(`${data.data}T00:00:00.000Z`),
          nutricionista: {
            connect: { id: nutritionistId }
          },
          paciente: {
            connect: { id: patientId },
          },
          status: INITIAL_STATUS },
        select: appointmentSelect,
      }),

    // todo: adicionar uma quantidade padrão de agendamentos por página e paginação
    listAppointments: (nutritionistId, filters = {}) =>
      client.agendamento.findMany({
        where: {
          nutricionistaId: nutritionistId,
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.from || filters.to
            ? { data: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } }
            : {}),
        },
        orderBy: [{ data: "asc" }, { horario: "asc" }],
        select: appointmentSelect,
      }),

    findAppointment,

    updateAppointment: async (nutritionistId, appointmentId, data) => {
      const { count } = await client.agendamento.updateMany({
        where: { id: appointmentId, nutricionistaId: nutritionistId },
        data,
      });
      return count === 1 ? findAppointment(nutritionistId, appointmentId) : null;
    },

    deleteAppointment: async (nutritionistId, appointmentId) =>
      (
        await client.agendamento.deleteMany({
          where: { id: appointmentId, nutricionistaId: nutritionistId },
        })
      ).count === 1,

    findConflicts: async (nutritionistId, slot, excludeAppointmentId) => {
      const sameDay = await client.agendamento.findMany({
        where: {
          nutricionistaId: nutritionistId,
          data: slot.data,
          status: { not: "Cancelada" },
          ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        },
        orderBy: [{ horario: "asc" }],
        select: appointmentSelect,
      });

      const start = toMinutes(slot.horario);
      const end = start + slot.duracao;

      return sameDay.filter((other) => {
        const otherStart = toMinutes(other.horario);
        const otherEnd = otherStart + other.duracao;
        return start < otherEnd && otherStart < end;
      });
    },
  };
}