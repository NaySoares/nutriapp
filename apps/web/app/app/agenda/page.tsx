'use client';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListFilter,
  MapPin,
  Plus,
  Search,
  X,
  CheckCircle2,
  CircleAlert,
  Video,
  Hospital,
  UserRound,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useHeaderStore } from '../../../stores/header-store';
import { useModalStore } from '../../../stores/modal-store';
import { FormsNewAppointment } from '../../../components/app/forms-appointment';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import { AppointmentRecord } from '@nutriapp/shared';
import { getInitials } from '../../../utils/name';
import { convertDateFromApi, DAYS, DAYS_SHORT, getWeekDates } from '../../../utils/date';

type AppointmentStatus =
  | 'Confirmada'
  | 'Aguardando confirmação'
  | 'Concluída'
  | 'Falta'
  | 'Cancelada';
type AppointmentType = 'Particular' | 'Hospitalar';
interface Appointment {
  id: number;
  patient: string;
  initials: string;
  date: string; // YYYY-MM-DD
  time: string;
  duration: number;
  type: AppointmentType;
  kind: string;
  status: AppointmentStatus;
  location: string;
  note?: string;
  color: string;
}


function statusToColor(status: AppointmentStatus): string {
  switch (status) {
    case 'Confirmada':
      return 'sage';
    case 'Aguardando confirmação':
      return 'peach';
    case 'Concluída':
        return 'blue';
    case 'Falta':
      return 'lilac';
    case 'Cancelada':
      return 'gray';
  }
}

const statusStyles: Record<AppointmentStatus, string> = {
  Confirmada: 'status-confirmed',
  'Aguardando confirmação': 'status-waiting',
  Concluída: 'status-done',
  Falta: 'status-missed',
  Cancelada: 'status-cancelled',
};

const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00`)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '');

type AppointmentsResponse = {
  agendamentos: AppointmentRecord[];
};

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [view, setView] = useState<'Semana' | 'Dia'>('Semana');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos os atendimentos');
  const [statusFilter, setStatusFilter] = useState('Todos os status');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRecord | null>(null);
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-10-19');;
  const [loading, setLoading] = useState(false);

  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    setLoading(true);
    apiRequest<AppointmentsResponse>("/appointments").then((response) => {
      setAppointments(response.agendamentos);
    }).catch((reason) => {
      toast.error(reason instanceof Error ? reason.message : "Erro ao buscar dados.");
    }).finally(() => {
      setLoading(false);
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setConfig({
      title: "Agenda",
      subtitle: "Organize seus atendimentos",
      actions: (
        <button
          className="btn-primary"
          onClick={() => openModal(<FormsNewAppointment onClose={() => { closeModal(); }} />)}
        >
          <Plus size={15} />
          Novo atendimento
        </button>
      )
    });

    return reset;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConfig, reset]);

  const dates = getWeekDates(new Date().toLocaleDateString('en-CA'));
  const weekDates = useMemo(
    () =>
      dates.map((date) => {
        const base = new Date(`${date}T12:00:00`);
        base.setDate(base.getDate() + weekOffset * 7);
        return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
      }),
    [weekOffset, dates],
  );

  const filtered = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const matchesDate = weekDates.includes(convertDateFromApi(appointment.data));
          const matchesName = appointment.pacienteNome
            .toLocaleLowerCase('pt-BR')
            .includes(query.trim().toLocaleLowerCase('pt-BR'));
          const matchesType =
            typeFilter === 'Todos os atendimentos' ||
            appointment.atendimento === typeFilter;
          const matchesStatus =
            statusFilter === 'Todos os status' ||
            appointment.status === statusFilter;
          return matchesDate && matchesName && matchesType && matchesStatus;
        })
        .sort((a, b) => a.horario.localeCompare(b.horario)),
    [appointments, weekDates, query, typeFilter, statusFilter],
  );

  const selectedDayAppointments = filtered
    .filter((appointment) => convertDateFromApi(appointment.data) === selectedDate)
    .sort((a, b) => a.horario.localeCompare(b.horario));
  const weekCount = filtered.length;
  const confirmedCount = filtered.filter(
    (appointment) => appointment.status === 'Confirmada',
  ).length;
  const pendingCount = filtered.filter(
    (appointment) => appointment.status === 'Aguardando confirmação',
  ).length;
  const missedCount = filtered.filter(
    (appointment) => appointment.status === 'Falta',
  ).length;
  const hasFilters =
    query.trim() !== '' ||
    typeFilter !== 'Todos os atendimentos' ||
    statusFilter !== 'Todos os status';

  function resetFilters() {
    setQuery('');
    setTypeFilter('Todos os atendimentos');
    setStatusFilter('Todos os status');
  }
  function moveWeek(direction: number) {
    setWeekOffset((current) => current + direction);
    setSelectedDate((current) => {
      const base = new Date(`${current}T12:00:00`);
      base.setDate(base.getDate() + direction * 7);
      return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
    });
  }

  async function updateStatus(appointment: AppointmentRecord, status: AppointmentStatus) {
    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id ? { ...item, status } : item,
      ),
    );

    const payload = { status };

    setLoading(true);
    try {
      await apiRequest(`/appointments/${appointment.id}`, { method: "PATCH", data: payload });
      toast.success("Status atualizado com sucesso.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Não foi possível editar o status do atendimento."
      );
    } finally {
      setLoading(false);
    }

    setSelectedAppointment(null);
  }

  const rangeLabel = `${new Date(`${weekDates[0]}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${new Date(`${weekDates[6]}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-[#263a2f]">
      <main className="agenda-main">
        <div className="agenda-content">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
                PLANEJAMENTO SEMANAL
              </div>
              <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
                Sua agenda, sem complicação
              </h1>
              <p className="mt-1 max-w-[620px] text-[12px] leading-5 text-[#7d8b83]">
                Visualize os atendimentos, confirme horários e identifique
                espaços livres para organizar a rotina.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="agenda-secondary"
                onClick={() => {
                  setWeekOffset(0);
                  setSelectedDate('2026-10-19');
                }}
              >
                Hoje
              </button>
              <div className="flex items-center rounded-lg border border-[#e4eae4] bg-white">
                <button
                  aria-label="Semana anterior"
                  className="p-2.5 text-[#718278] hover:text-[#287653]"
                  onClick={() => moveWeek(-1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  aria-label="Próxima semana"
                  className="border-x border-[#edf1ed] px-3 py-2 text-[11px] font-semibold text-[#53665a]"
                >
                  {rangeLabel}
                </button>
                <button
                  aria-label="Próxima semana"
                  className="p-2.5 text-[#718278] hover:text-[#287653]"
                  onClick={() => moveWeek(1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="agenda-panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Atendimentos na semana
                </div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {weekCount}
                </div>
              </div>
            </div>
            <div className="agenda-panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">Confirmadas</div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {confirmedCount}
                </div>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('Aguardando confirmação')}
              className="agenda-panel flex items-center gap-3 p-4 text-left transition hover:border-[#e2d4b9]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
                <Clock3 size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Aguardando confirmação
                </div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {pendingCount}
                </div>
              </div>
              <ChevronRight size={15} className="ml-auto text-[#a1aca5]" />
            </button>
            <button
              onClick={() => setStatusFilter('Falta')}
              className="agenda-panel flex items-center gap-3 p-4 text-left transition hover:border-[#ebc9c1]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0ed] text-[#b65c50]">
                <CircleAlert size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Faltas para revisar
                </div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {missedCount}
                </div>
              </div>
              <ChevronRight size={15} className="ml-auto text-[#a1aca5]" />
            </button>
          </section>

          <section className="agenda-panel overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-[#edf1ed] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-bold text-[#304638]">
                    Calendário de atendimentos
                  </h2>
                  <p className="mt-1 text-[11px] text-[#87948b]">
                    Selecione um dia para ver a agenda detalhada.
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-[#f3f6f3] p-1">
                  <button
                    onClick={() => setView('Semana')}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${view === 'Semana' ? 'bg-white text-[#287653] shadow-sm' : 'text-[#849188]'}`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setView('Dia')}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${view === 'Dia' ? 'bg-white text-[#287653] shadow-sm' : 'text-[#849188]'}`}
                  >
                    Dia
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2.5 text-[#98a39b] lg:w-[260px]">
                  <Search size={14} />
                  <input
                    aria-label="Buscar consulta por nome do paciente"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar paciente..."
                    className="w-full bg-transparent text-[11px] text-[#304638] outline-none placeholder:text-[#9ba69e]"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Filtrar modalidade"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="agenda-select"
                  >
                    <option>Todos os atendimentos</option>
                    <option>Particular</option>
                    <option>Hospitalar</option>
                  </select>
                  <select
                    aria-label="Filtrar status da consulta"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="agenda-select"
                  >
                    <option>Todos os status</option>
                    <option>Confirmada</option>
                    <option>Aguardando confirmação</option>
                    <option>Concluída</option>
                    <option>Falta</option>
                    <option>Cancelada</option>
                  </select>
                  <button
                    className="agenda-secondary"
                    onClick={() => setShowFilters((current) => !current)}
                  >
                    <SlidersHorizontal size={13} />
                    {showFilters ? 'Menos filtros' : 'Filtros'}
                  </button>
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 px-2 text-[11px] font-semibold text-[#287653]"
                    >
                      <RotateCcw size={12} />
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              {showFilters && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f6f9f6] p-3 text-[11px] text-[#718278]">
                  <ListFilter size={14} />
                  <span>
                    Os filtros afetam os cartões da semana e a lista do dia
                    selecionado.
                  </span>
                  <button
                    className="ml-auto font-semibold text-[#287653]"
                    onClick={resetFilters}
                  >
                    Redefinir filtros
                  </button>
                </div>
              )}
            </div>

            {view === 'Semana' ? (
              <div className="agenda-week-scroll">
                <div className="agenda-week-grid grid grid-cols-7 divide-x divide-[#edf1ed]">
                  {weekDates.map((date, index) => {
                    const dayAppointments = filtered.filter(
                      (appointment) => convertDateFromApi(appointment.data) === date,
                    );
                    const isSelected = selectedDate === date;
                    return (
                      <div
                        key={date}
                        className={`min-h-[330px] ${isSelected ? 'bg-[#fbfdfb]' : 'bg-white'}`}
                      >
                        <button
                          onClick={() => setSelectedDate(date)}
                          className={`flex w-full flex-col items-center border-b px-2 py-3 transition ${isSelected ? 'border-[#cde2d2] bg-[#edf6ef]' : 'border-[#edf1ed] hover:bg-[#fafcfa]'}`}
                        >
                          <span
                            className={`text-[10px] font-semibold ${isSelected ? 'text-[#287653]' : 'text-[#87948b]'}`}
                          >
                            {DAYS_SHORT[index]}
                          </span>
                          <span
                            className={`mt-1 grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold ${isSelected ? 'bg-[#287653] text-white' : 'text-[#304638]'}`}
                          >
                            {new Date(`${date}T12:00:00`).getDate()}
                          </span>
                          <span className="mt-1 text-[9px] text-[#87948b]">
                            {dayAppointments.length}{' '}
                            {dayAppointments.length === 1
                              ? 'consulta'
                              : 'consultas'}
                          </span>
                        </button>
                        <div className="space-y-2 p-2">
                          {dayAppointments.length ? (
                            dayAppointments.map((appointment) => (
                              <button
                                key={appointment.id}
                                onClick={() =>
                                  setSelectedAppointment(appointment)
                                }
                                className={`appointment-card ${statusToColor(appointment.status)}`}
                              >
                                <div className="mb-1 text-[10px] font-bold text-[#355743]">
                                  {appointment.horario}
                                </div>
                                <div className="mb-2 line-clamp-2 text-[10px] font-semibold leading-[1.45] text-[#405448]">
                                  {appointment.pacienteNome}
                                </div>
                                <div className="mb-2 text-[9px] leading-[1.4] text-[#89968e]">
                                  {appointment.tipoConsulta}
                                </div>
                                <span
                                  className={`appointment-status ${statusStyles[appointment.status]}`}
                                >
                                  {appointment.status ===
                                  'Aguardando confirmação'
                                    ? 'Pendente'
                                    : appointment.status}
                                </span>
                              </button>
                            ))
                          ) : (
                            <button
                              onClick={() => {
                                toast.error('Função indisponível, use o botão de "Novo Atendimento" no topo da página.');
                              }}
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
            ) : (
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#304638]">
                      {DAYS[weekDates.indexOf(selectedDate)] ||
                        new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                          'pt-BR',
                          { weekday: 'long' },
                        )}
                    </h3>
                    <p className="mt-1 text-[11px] text-[#87948b]">
                      {dateLabel(selectedDate)} ·{' '}
                      {selectedDayAppointments.length} atendimentos
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNewDate(selectedDate);
                      setShowModal(true);
                    }}
                    className="agenda-primary ml-auto"
                  >
                    <Plus size={14} />
                    Agendar
                  </button>
                </div>
                {selectedDayAppointments.length ? (
                  <div className="space-y-2">
                    {selectedDayAppointments.map((appointment) => (
                      <button
                        key={appointment.id}
                        onClick={() => setSelectedAppointment(appointment)}
                        className="flex w-full items-center gap-3 rounded-xl border border-[#e8eee8] p-3 text-left transition hover:bg-[#fbfdfb] sm:gap-4 sm:p-4"
                      >
                        <div className="w-12 shrink-0 text-[12px] font-bold text-[#355743]">
                          {appointment.horario}
                        </div>
                        <div className={`agenda-avatar ${statusToColor(appointment.status)}`}>
                          {getInitials(appointment.pacienteNome)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-semibold text-[#304638]">
                            {appointment.pacienteNome}
                          </div>
                          <div className="mt-1 text-[10px] text-[#87948b]">
                            {appointment.tipoConsulta} · {appointment.duracao} min
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#87948b]">
                            <MapPin size={11} />
                            {appointment.local}
                          </div>
                        </div>
                        <span
                          className={`appointment-status hidden sm:inline-flex ${statusStyles[appointment.status]}`}
                        >
                          {appointment.status}
                        </span>
                        <ChevronRight size={15} className="text-[#9ba69e]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#e2eae3] px-5 py-12 text-center">
                    <CalendarDays
                      size={24}
                      className="mx-auto text-[#9cb9a4]"
                    />
                    <p className="mt-3 text-[13px] font-semibold text-[#304638]">
                      Agenda livre neste dia
                    </p>
                    <p className="mt-1 text-[11px] text-[#87948b]">
                      Você pode reservar um horário para um paciente.
                    </p>
                    <button
                      onClick={() => {
                        setNewDate(selectedDate);
                        setShowModal(true);
                      }}
                      className="agenda-primary mt-4"
                    >
                      <Plus size={14} />
                      Nova consulta
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#edf1ed] px-4 py-3 sm:px-5">
              <span className="text-[10px] font-semibold text-[#87948b]">
                STATUS
              </span>
              <span className="appointment-status status-confirmed">
                <CheckCircle2 size={10} />
                Confirmada
              </span>
              <span className="appointment-status status-waiting">
                <Clock3 size={10} />
                Aguardando confirmação
              </span>
              <span className="appointment-status status-done">Concluída</span>
              <span className="appointment-status status-missed">
                <CircleAlert size={10} />
                Falta
              </span>
            </div>
          </section>
        </div>
      </main>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-2 rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-[12px] text-[#355743] shadow-lg"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#287653]" />
          <span>{notice}</span>
          <button
            aria-label="Fechar aviso"
            onClick={() => setNotice('')}
            className="ml-2 text-[#87948b]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {selectedAppointment && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setSelectedAppointment(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-detail-title"
            className="my-auto w-full max-w-[460px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`agenda-avatar h-12 w-12 rounded-2xl text-[12px] ${statusToColor(selectedAppointment.status)}`}
                >
                  {getInitials(selectedAppointment.pacienteNome)}
                </div>
                <div>
                  <h2
                    id="appointment-detail-title"
                    className="text-[17px] font-bold text-[#20352c]"
                  >
                    {selectedAppointment.pacienteNome}
                  </h2>
                  <p className="mt-1 text-[11px] text-[#87948b]">
                    {selectedAppointment.tipoConsulta}
                  </p>
                </div>
              </div>
              <button
                aria-label="Fechar detalhes"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg p-2 text-[#87948b] hover:bg-[#f5f8f5]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 space-y-3 rounded-xl bg-[#f7f9f7] p-4">
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                <CalendarDays size={15} className="text-[#7f9885]" />
                {new Date(
                  `${convertDateFromApi(selectedAppointment.data)}T12:00:00`,
                ).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                <Clock3 size={15} className="text-[#7f9885]" />
                {selectedAppointment.horario} · {selectedAppointment.duracao}{' '}
                minutos
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                {selectedAppointment.local === 'Online' ? (
                  <Video size={15} className="text-[#7f9885]" />
                ) : selectedAppointment.local === 'Hospital' ? (
                  <Hospital size={15} className="text-[#7f9885]" />
                ) : (
                  <MapPin size={15} className="text-[#7f9885]" />
                )}
                {selectedAppointment.local}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                <UserRound size={15} className="text-[#7f9885]" />
                Atendimento {selectedAppointment.tipoConsulta.toLowerCase()}
              </div>
              <div className="pt-1">
                <span
                  className={`appointment-status ${statusStyles[selectedAppointment.status]}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-semibold text-[#53665a]">
                Atualizar status
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'Confirmada',
                    'Concluída',
                    'Falta',
                    'Cancelada',
                  ] as AppointmentStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedAppointment, status)}
                    disabled={selectedAppointment.status === status}
                    className={`rounded-lg border px-3 py-2 text-[10px] font-semibold transition disabled:cursor-default disabled:opacity-45 ${status === 'Falta' ? 'border-[#f0d6d0] text-[#b65c50] hover:bg-[#fff5f2]' : 'border-[#e4eae4] text-[#53665a] hover:bg-[#f5f8f5]'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] leading-4 text-[#87948b]">
                Registre faltas com cuidado e revise o contexto antes de decidir
                sobre o próximo contato.
              </p>
            </div>
            <div className="mt-5 flex justify-end border-t border-[#edf1ed] pt-4">
              <button
                className="agenda-secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
