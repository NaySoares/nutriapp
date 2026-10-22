'use client';

import {
  Apple,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  ListFilter,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Users,
  Wallet,
  FileText,
  X,
  CheckCircle2,
  CircleAlert,
  CalendarCheck,
  Video,
  Hospital,
  UserRound,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SideBar } from '../../../components/layout/sidebar';
import { useHeaderStore } from '../../../stores/header-store';
import { useModalStore } from '../../../stores/modal-store';
import { FormsNewAppointment } from '../../../components/app/forms-appointment';

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

const dates = [
  '2026-10-19',
  '2026-10-20',
  '2026-10-21',
  '2026-10-22',
  '2026-10-23',
  '2026-10-24',
  '2026-10-25',
];
const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: 'Camila Ferreira',
    initials: 'CF',
    date: '2026-10-19',
    time: '09:00',
    duration: 50,
    type: 'Hospitalar',
    kind: 'Acompanhamento',
    status: 'Concluída',
    location: 'Hospital · Ala clínica',
    color: 'sage',
  },
  {
    id: 2,
    patient: 'Rafael Almeida',
    initials: 'RA',
    date: '2026-10-19',
    time: '10:30',
    duration: 45,
    type: 'Particular',
    kind: 'Consulta de retorno',
    status: 'Confirmada',
    location: 'Consultório · Sala 1',
    color: 'blue',
  },
  {
    id: 3,
    patient: 'Mariana Costa',
    initials: 'MC',
    date: '2026-10-19',
    time: '14:00',
    duration: 60,
    type: 'Particular',
    kind: 'Avaliação nutricional',
    status: 'Aguardando confirmação',
    location: 'Online',
    color: 'lilac',
  },
  {
    id: 4,
    patient: 'João Pedro Lima',
    initials: 'JL',
    date: '2026-10-20',
    time: '08:30',
    duration: 45,
    type: 'Particular',
    kind: 'Consulta de retorno',
    status: 'Aguardando confirmação',
    location: 'Consultório · Sala 1',
    color: 'peach',
  },
  {
    id: 5,
    patient: 'Lucas Martins',
    initials: 'LM',
    date: '2026-10-20',
    time: '10:00',
    duration: 30,
    type: 'Hospitalar',
    kind: 'Revisão do plano',
    status: 'Confirmada',
    location: 'Hospital · Ala clínica',
    color: 'blue',
  },
  {
    id: 6,
    patient: 'Beatriz Santos',
    initials: 'BS',
    date: '2026-10-20',
    time: '13:30',
    duration: 50,
    type: 'Particular',
    kind: 'Avaliação nutricional',
    status: 'Confirmada',
    location: 'Consultório · Sala 1',
    color: 'sage',
  },
  {
    id: 7,
    patient: 'Pedro Henrique Silva',
    initials: 'PS',
    date: '2026-10-21',
    time: '09:00',
    duration: 45,
    type: 'Hospitalar',
    kind: 'Acompanhamento',
    status: 'Confirmada',
    location: 'Hospital · Ala clínica',
    color: 'lilac',
  },
  {
    id: 8,
    patient: 'Isabela Rocha',
    initials: 'IR',
    date: '2026-10-21',
    time: '11:00',
    duration: 50,
    type: 'Particular',
    kind: 'Consulta de retorno',
    status: 'Falta',
    location: 'Consultório · Sala 1',
    color: 'peach',
  },
  {
    id: 9,
    patient: 'Gabriel Nunes',
    initials: 'GN',
    date: '2026-10-21',
    time: '15:00',
    duration: 45,
    type: 'Particular',
    kind: 'Acompanhamento',
    status: 'Confirmada',
    location: 'Online',
    color: 'blue',
  },
  {
    id: 10,
    patient: 'Rafael Almeida',
    initials: 'RA',
    date: '2026-10-22',
    time: '10:30',
    duration: 45,
    type: 'Particular',
    kind: 'Consulta de retorno',
    status: 'Confirmada',
    location: 'Consultório · Sala 1',
    color: 'sage',
  },
  {
    id: 11,
    patient: 'Camila Ferreira',
    initials: 'CF',
    date: '2026-10-22',
    time: '13:00',
    duration: 30,
    type: 'Hospitalar',
    kind: 'Acompanhamento',
    status: 'Confirmada',
    location: 'Hospital · Ala clínica',
    color: 'lilac',
  },
  {
    id: 12,
    patient: 'Mariana Costa',
    initials: 'MC',
    date: '2026-10-23',
    time: '09:00',
    duration: 60,
    type: 'Particular',
    kind: 'Consulta de retorno',
    status: 'Confirmada',
    location: 'Consultório · Sala 1',
    color: 'peach',
  },
  {
    id: 13,
    patient: 'Beatriz Santos',
    initials: 'BS',
    date: '2026-10-23',
    time: '14:00',
    duration: 45,
    type: 'Particular',
    kind: 'Revisão do plano',
    status: 'Aguardando confirmação',
    location: 'Online',
    color: 'blue',
  },
  {
    id: 14,
    patient: 'Pedro Henrique Silva',
    initials: 'PS',
    date: '2026-10-24',
    time: '10:00',
    duration: 45,
    type: 'Hospitalar',
    kind: 'Acompanhamento',
    status: 'Confirmada',
    location: 'Hospital · Ala clínica',
    color: 'sage',
  },
];

const statusStyles: Record<AppointmentStatus, string> = {
  Confirmada: 'status-confirmed',
  'Aguardando confirmação': 'status-waiting',
  Concluída: 'status-done',
  Falta: 'status-missed',
  Cancelada: 'status-cancelled',
};
const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const fullDayNames = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];
const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00`)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '');

export default function AgendaPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState('2026-10-19');
  const [view, setView] = useState<'Semana' | 'Dia'>('Semana');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos os atendimentos');
  const [statusFilter, setStatusFilter] = useState('Todos os status');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newPatient, setNewPatient] = useState('');
  const [newDate, setNewDate] = useState('2026-10-19');
  const [newTime, setNewTime] = useState('16:00');
  const [newDuration, setNewDuration] = useState('45');
  const [newType, setNewType] = useState<AppointmentType>('Particular');
  const [newKind, setNewKind] = useState('Consulta de retorno');
  const [newLocation, setNewLocation] = useState('Consultório · Sala 1');

  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

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

  const weekDates = useMemo(
    () =>
      dates.map((date) => {
        const base = new Date(`${date}T12:00:00`);
        base.setDate(base.getDate() + weekOffset * 7);
        return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
      }),
    [weekOffset],
  );

  const filtered = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const matchesDate = weekDates.includes(appointment.date);
          const matchesName = appointment.patient
            .toLocaleLowerCase('pt-BR')
            .includes(query.trim().toLocaleLowerCase('pt-BR'));
          const matchesType =
            typeFilter === 'Todos os atendimentos' ||
            appointment.type === typeFilter;
          const matchesStatus =
            statusFilter === 'Todos os status' ||
            appointment.status === statusFilter;
          return matchesDate && matchesName && matchesType && matchesStatus;
        })
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, weekDates, query, typeFilter, statusFilter],
  );

  const selectedDayAppointments = filtered
    .filter((appointment) => appointment.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
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

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  }
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
  function updateStatus(appointment: Appointment, status: AppointmentStatus) {
    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id ? { ...item, status } : item,
      ),
    );
    setSelectedAppointment(null);
    flash(
      `${appointment.patient}: atendimento atualizado para “${status.toLocaleLowerCase('pt-BR')}”.`,
    );
  }
  function addAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPatient.trim()) return;
    const initials = newPatient
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
    const appointment: Appointment = {
      id: Date.now(),
      patient: newPatient.trim(),
      initials,
      date: newDate,
      time: newTime,
      duration: Number(newDuration),
      type: newType,
      kind: newKind,
      status: 'Aguardando confirmação',
      location: newLocation,
      color: 'sage',
    };
    setAppointments((current) => [...current, appointment]);
    setSelectedDate(newDate);
    setNewPatient('');
    setShowModal(false);
    setWeekOffset(0);
    flash(
      `Consulta de ${appointment.patient} adicionada à agenda de demonstração.`,
    );
  }

  const rangeLabel = `${new Date(`${weekDates[0]}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${new Date(`${weekDates[6]}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-[#263a2f]">
      {mobileNavOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <style jsx global>{`
        .agenda-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 20;
          display: flex;
          width: 244px;
          flex-direction: column;
          border-right: 1px solid #e9eee9;
          background: #fff;
          padding: 27px 16px 18px;
        }
        .agenda-brand-mark {
          display: grid;
          height: 36px;
          width: 36px;
          place-items: center;
          border-radius: 12px;
          background: #287653;
          color: white;
        }
        .agenda-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 9px;
          padding: 10px 12px;
          color: #7c8b81;
          font-size: 12px;
          transition: all 0.15s;
        }
        .agenda-nav-item:hover {
          background: #f6f9f6;
          color: #355743;
        }
        .agenda-nav-item.active {
          background: #eaf4ed;
          color: #287653;
          font-weight: 650;
        }
        .agenda-main {
          margin-left: 244px;
          min-height: 100vh;
        }
        .agenda-topbar {
          display: flex;
          min-height: 78px;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid #e9eee9;
          background: #fff;
          padding: 16px 32px;
        }
        .agenda-content {
          padding: 27px 32px 40px;
          max-width: 1600px;
          margin: 0 auto;
        }
        .agenda-panel {
          border: 1px solid #e8eee8;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(31, 57, 40, 0.025);
        }
        .appointment-card {
          width: 100%;
          border: 1px solid #e7eee8;
          border-left: 3px solid #6da985;
          border-radius: 8px;
          background: #fbfdfb;
          padding: 9px 9px 10px;
          text-align: left;
          transition:
            box-shadow 0.15s,
            transform 0.15s;
        }
        .appointment-card:hover {
          box-shadow: 0 4px 12px rgba(38, 73, 48, 0.08);
          transform: translateY(-1px);
        }
        .appointment-card.blue {
          border-left-color: #7b9ec6;
          background: #f8faff;
        }
        .appointment-card.lilac {
          border-left-color: #a395c7;
          background: #fbf9ff;
        }
        .appointment-card.peach {
          border-left-color: #d6a078;
          background: #fffaf6;
        }
        .appointment-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 20px;
          padding: 4px 7px;
          font-size: 9px;
          font-weight: 650;
          white-space: nowrap;
        }
        .status-confirmed {
          background: #e9f5ed;
          color: #287653;
        }
        .status-waiting {
          background: #fff4df;
          color: #9b6b21;
        }
        .status-done {
          background: #edf2fa;
          color: #5576a3;
        }
        .status-missed {
          background: #fff0ed;
          color: #b65c50;
        }
        .status-cancelled {
          background: #f0f2f0;
          color: #7d8b83;
        }
        .agenda-avatar {
          display: grid;
          height: 28px;
          width: 28px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          background: #e4f0e7;
          color: #3b7752;
          font-size: 9px;
          font-weight: 700;
        }
        .agenda-avatar.blue {
          background: #eaf0fa;
          color: #5876a2;
        }
        .agenda-avatar.lilac {
          background: #f0ebfa;
          color: #7c69a6;
        }
        .agenda-avatar.peach {
          background: #faeee4;
          color: #a66e43;
        }
        .agenda-select {
          border: 1px solid #e4eae4;
          border-radius: 9px;
          background: white;
          padding: 9px 11px;
          font-size: 11px;
          color: #607166;
          outline: none;
        }
        .agenda-select:focus {
          border-color: #8ab69a;
        }
        .agenda-mobile-menu {
          display: none;
        }
        @media (max-width: 900px) {
          .agenda-sidebar {
            transform: translateX(-100%);
            transition: transform 0.2s;
          }
          .agenda-sidebar.open {
            transform: translateX(0);
          }
          .agenda-main {
            margin-left: 0;
          }
          .agenda-mobile-menu {
            display: inline-flex;
          }
          .agenda-topbar {
            padding: 14px 18px;
          }
          .agenda-content {
            padding: 22px 18px 32px;
          }
        }
        @media (max-width: 600px) {
          .agenda-content {
            padding: 18px 12px 28px;
          }
          .agenda-topbar {
            padding: 12px;
          }
          .agenda-week-grid {
            min-width: 820px;
          }
          .agenda-week-scroll {
            overflow-x: auto;
            padding-bottom: 6px;
          }
          .agenda-heading {
            font-size: 22px;
          }
        }
      `}</style>

      <main className="agenda-main">
        <div className="agenda-content">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
                PLANEJAMENTO SEMANAL
              </div>
              <h1 className="agenda-heading text-[26px] font-bold tracking-[-1px] text-[#20352c]">
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
                      (appointment) => appointment.date === date,
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
                            {dayNames[index]}
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
                                className={`appointment-card ${appointment.color}`}
                              >
                                <div className="mb-1 text-[10px] font-bold text-[#355743]">
                                  {appointment.time}
                                </div>
                                <div className="mb-2 line-clamp-2 text-[10px] font-semibold leading-[1.45] text-[#405448]">
                                  {appointment.patient}
                                </div>
                                <div className="mb-2 text-[9px] leading-[1.4] text-[#89968e]">
                                  {appointment.kind}
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
                                setSelectedDate(date);
                                setNewDate(date);
                                setShowModal(true);
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
                      {fullDayNames[weekDates.indexOf(selectedDate)] ||
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
                          {appointment.time}
                        </div>
                        <div className={`agenda-avatar ${appointment.color}`}>
                          {appointment.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-semibold text-[#304638]">
                            {appointment.patient}
                          </div>
                          <div className="mt-1 text-[10px] text-[#87948b]">
                            {appointment.kind} · {appointment.duration} min
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#87948b]">
                            <MapPin size={11} />
                            {appointment.location}
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

          <section className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="agenda-panel flex items-start gap-3 p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
                <Clock3 size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[12px] font-bold text-[#304638]">
                  Confirmações pendentes
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-[#7d8b83]">
                  {pendingCount
                    ? `${pendingCount} consultas ainda aguardam confirmação. Considere revisá-las antes do horário marcado.`
                    : 'Todas as consultas exibidas estão confirmadas ou já foram atualizadas.'}
                </p>
              </div>
              <button
                onClick={() => setStatusFilter('Aguardando confirmação')}
                className="shrink-0 text-[11px] font-semibold text-[#287653]"
              >
                Revisar
              </button>
            </div>
            <div className="agenda-panel flex items-start gap-3 p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff0ed] text-[#b65c50]">
                <CircleAlert size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[12px] font-bold text-[#304638]">
                  Acompanhamento após falta
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-[#7d8b83]">
                  Uma falta registrada não implica desinteresse. Revise o
                  histórico e combine o próximo passo com o paciente.
                </p>
              </div>
              <button
                onClick={() => setStatusFilter('Falta')}
                className="shrink-0 text-[11px] font-semibold text-[#287653]"
              >
                Ver faltas
              </button>
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

      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-appointment-title"
            className="my-auto w-full max-w-[520px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
                  AGENDAMENTO
                </div>
                <h2
                  id="new-appointment-title"
                  className="text-[20px] font-bold tracking-[-.5px] text-[#20352c]"
                >
                  Nova consulta
                </h2>
                <p className="mt-1 text-[11px] text-[#87948b]">
                  Crie um horário na agenda demonstrativa.
                </p>
              </div>
              <button
                aria-label="Fechar"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-[#87948b] hover:bg-[#f5f8f5]"
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={addAppointment} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                  Nome do paciente <span className="text-[#b65c50]">*</span>
                </span>
                <input
                  required
                  autoFocus
                  value={newPatient}
                  onChange={(event) => setNewPatient(event.target.value)}
                  placeholder="Digite o nome do paciente"
                  className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Data
                  </span>
                  <input
                    required
                    type="date"
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                    className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Horário
                  </span>
                  <input
                    required
                    type="time"
                    value={newTime}
                    onChange={(event) => setNewTime(event.target.value)}
                    className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Duração
                  </span>
                  <select
                    value={newDuration}
                    onChange={(event) => setNewDuration(event.target.value)}
                    className="agenda-select w-full"
                  >
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="50">50 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Atendimento
                  </span>
                  <select
                    value={newType}
                    onChange={(event) =>
                      setNewType(event.target.value as AppointmentType)
                    }
                    className="agenda-select w-full"
                  >
                    <option>Particular</option>
                    <option>Hospitalar</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                  Tipo de consulta
                </span>
                <select
                  value={newKind}
                  onChange={(event) => setNewKind(event.target.value)}
                  className="agenda-select w-full"
                >
                  <option>Consulta de retorno</option>
                  <option>Avaliação nutricional</option>
                  <option>Acompanhamento</option>
                  <option>Revisão do plano</option>
                  <option>Primeira consulta</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                  Local
                </span>
                <select
                  value={newLocation}
                  onChange={(event) => setNewLocation(event.target.value)}
                  className="agenda-select w-full"
                >
                  <option>Consultório</option>
                  <option>Online</option>
                  <option>Hospital</option>
                </select>
              </label>
              <p className="rounded-lg bg-[#f6f9f6] p-3 text-[10px] leading-4 text-[#7d8b83]">
                A consulta ficará como “Aguardando confirmação”. Neste
                protótipo, as alterações existem apenas durante a sessão.
              </p>
              <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
                <button
                  type="button"
                  className="agenda-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="agenda-primary">
                  <Plus size={14} />
                  Adicionar à agenda
                </button>
              </div>
            </form>
          </div>
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
                  className={`agenda-avatar h-12 w-12 rounded-2xl text-[12px] ${selectedAppointment.color}`}
                >
                  {selectedAppointment.initials}
                </div>
                <div>
                  <h2
                    id="appointment-detail-title"
                    className="text-[17px] font-bold text-[#20352c]"
                  >
                    {selectedAppointment.patient}
                  </h2>
                  <p className="mt-1 text-[11px] text-[#87948b]">
                    {selectedAppointment.kind}
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
                  `${selectedAppointment.date}T12:00:00`,
                ).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                <Clock3 size={15} className="text-[#7f9885]" />
                {selectedAppointment.time} · {selectedAppointment.duration}{' '}
                minutos
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                {selectedAppointment.location === 'Online' ? (
                  <Video size={15} className="text-[#7f9885]" />
                ) : selectedAppointment.type === 'Hospitalar' ? (
                  <Hospital size={15} className="text-[#7f9885]" />
                ) : (
                  <MapPin size={15} className="text-[#7f9885]" />
                )}
                {selectedAppointment.location}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#53665a]">
                <UserRound size={15} className="text-[#7f9885]" />
                Atendimento {selectedAppointment.type.toLowerCase()}
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
