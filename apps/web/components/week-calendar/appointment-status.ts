import type { AppointmentStatus } from '@nutriapp/shared';

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  confirmada: 'sage',
  aguardando_confirmacao: 'peach',
  concluida: 'blue',
  falta: 'lilac',
  cancelada: 'gray',
};

export const statusStyles: Record<AppointmentStatus, string> = {
  confirmada: 'status-confirmed',
  aguardando_confirmacao: 'status-waiting',
  concluida: 'status-done',
  falta: 'status-missed',
  cancelada: 'status-cancelled',
};

export const statusToColor = (status: AppointmentStatus) => STATUS_COLOR[status];

export const statusShortLabel = (status: AppointmentStatus) =>
  status === 'aguardando_confirmacao' ? 'Pendente' : status;