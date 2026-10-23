import type { AppointmentStatus } from '@nutriapp/shared';

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  Confirmada: 'sage',
  'Aguardando confirmação': 'peach',
  Concluída: 'blue',
  Falta: 'lilac',
  Cancelada: 'gray',
};

export const statusStyles: Record<AppointmentStatus, string> = {
  Confirmada: 'status-confirmed',
  'Aguardando confirmação': 'status-waiting',
  Concluída: 'status-done',
  Falta: 'status-missed',
  Cancelada: 'status-cancelled',
};

export const statusToColor = (status: AppointmentStatus) => STATUS_COLOR[status];

export const statusShortLabel = (status: AppointmentStatus) =>
  status === 'Aguardando confirmação' ? 'Pendente' : status;