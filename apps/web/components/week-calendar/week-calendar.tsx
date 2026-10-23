'use client';

import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import type { AppointmentRecord } from '@nutriapp/shared';
import { DAYS_SHORT } from '../../utils/date';
import { statusShortLabel, statusStyles, statusToColor } from './appointment-status';
import { groupByDay } from './appointments-by-day';

export type WeekCalendarItem = Pick<
  AppointmentRecord,
  'id' | 'data' | 'horario' | 'pacienteNome' | 'tipoConsulta' | 'status'
>;

type WeekCalendarProps<T extends WeekCalendarItem> = {
  weekDates: string[]; // 7 datas YYYY-MM-DD
  selectedDate: string;
  appointments: T[];
  onSelectDate: (date: string) => void;
  onSelectAppointment: (appointment: T) => void;
  /** Se omitido, dias vazios não mostram o botão "Adicionar". */
  onAddAppointment?: (date: string) => void;
};

function AppointmentCard({ appointment, onClick }: { appointment: WeekCalendarItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`appointment-card ${statusToColor(appointment.status)}`}
    >
      <div className="mb-1 text-[10px] font-bold text-[#355743]">{appointment.horario}</div>
      <div className="mb-2 line-clamp-2 text-[10px] font-semibold leading-[1.45] text-[#405448]">
        {appointment.pacienteNome}
      </div>
      <div className="mb-2 text-[9px] leading-[1.4] text-[#89968e]">{appointment.tipoConsulta}</div>
      <span className={`appointment-status ${statusStyles[appointment.status]}`}>
        {statusShortLabel(appointment.status)}
      </span>
    </button>
  );
}

export function WeekCalendar<T extends WeekCalendarItem>({
  weekDates,
  selectedDate,
  appointments,
  onSelectDate,
  onSelectAppointment,
  onAddAppointment,
}: WeekCalendarProps<T>) {
  const byDay = useMemo(() => groupByDay(appointments), [appointments]);

  return (
    <div className="agenda-week-scroll">
      <div className="agenda-week-grid grid grid-cols-7 divide-x divide-[#edf1ed]">
        {weekDates.map((date, index) => {
          const dayAppointments = byDay.get(date) ?? [];
          const isSelected = selectedDate === date;

          return (
            <div key={date} className={`min-h-[330px] ${isSelected ? 'bg-[#fbfdfb]' : 'bg-white'}`}>
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                className={`flex w-full flex-col items-center border-b px-2 py-3 transition ${
                  isSelected ? 'border-[#cde2d2] bg-[#edf6ef]' : 'border-[#edf1ed] hover:bg-[#fafcfa]'
                }`}
              >
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#287653]' : 'text-[#87948b]'}`}>
                  {DAYS_SHORT[index]}
                </span>
                <span
                  className={`mt-1 grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold ${
                    isSelected ? 'bg-[#287653] text-white' : 'text-[#304638]'
                  }`}
                >
                  {Number(date.slice(8, 10))}
                </span>
                <span className="mt-1 text-[9px] text-[#87948b]">
                  {dayAppointments.length} {dayAppointments.length === 1 ? 'consulta' : 'consultas'}
                </span>
              </button>

              <div className="space-y-2 p-2">
                {dayAppointments.length > 0
                  ? dayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => onSelectAppointment(appointment)}
                      />
                    ))
                  : onAddAppointment && (
                      <button
                        type="button"
                        onClick={() => onAddAppointment(date)}
                        className="flex min-h-[66px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#e4ebe5] text-[#a1aca5] transition hover:border-[#9fc5aa] hover:bg-[#f8fbf8] hover:text-[#287653]"
                      >
                        <Plus size={15} />
                        <span className="text-[9px]">Adicionar</span>
                      </button>
                    )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}