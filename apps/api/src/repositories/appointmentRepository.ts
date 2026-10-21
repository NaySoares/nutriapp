import {
  STATUS_AGENDAMENTO,
  type AppointmentCreate,
  type AppointmentUpdate,
} from "@nutriapp/shared";
import type { AuthPrisma } from "../types/auth.js";

export type AppointmentStatus = (typeof STATUS_AGENDAMENTO)[number];

// ASSUMIDO: modelo `agendamento` com estes campos. Ajuste ao schema.prisma real
// (ex.: `data` como DateTime/@db.Date, `pacienteId` em vez de `paciente` texto).
export type AppointmentRecord = {
  id: string;
  nutricionistaId: string;
  pacienteId: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  duracao: number; // minutos
  atendimento: AppointmentCreate["atendimento"];
  tipoConsulta: AppointmentCreate["tipoConsulta"];
  local: AppointmentCreate["local"];
  note: string | null;
  status: AppointmentStatus;
  criadoEm: Date;
  atualizadoEm: Date;
};

type AppointmentSelect = { [K in keyof AppointmentRecord]: true };

export type AppointmentFilters = {
  from?: string; // YYYY-MM-DD, inclusivo
  to?: string; // YYYY-MM-DD, inclusivo
  status?: AppointmentStatus;
};

type AppointmentSlot = Pick<AppointmentCreate, "data" | "horario" | "duracao">;

export type AppointmentRepository = {
  createAppointment: (nutritionistId: string, data: AppointmentCreate) => Promise<AppointmentRecord>;
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

export function createAppointmentRepository(prisma: AuthPrisma): AppointmentRepository {
  const client = prisma as unknown as AppointmentClient;

  const findAppointment: AppointmentRepository["findAppointment"] = (nutritionistId, appointmentId) =>
    client.agendamento.findFirst({
      where: { id: appointmentId, nutricionistaId: nutritionistId },
      select: appointmentSelect,
    });

  return {
    createAppointment: (nutritionistId, data) =>
      client.agendamento.create({
        data: { nutricionistaId: nutritionistId, ...data, status: INITIAL_STATUS },
        select: appointmentSelect,
      }),

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