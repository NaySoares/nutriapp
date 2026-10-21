'use client';

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  MoreHorizontal,
  Plus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useHeaderStore } from '../../../stores/header-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useModalStore } from '../../../stores/modal-store';
import { getCurrentDay, getCurrentDayWithoutYear } from '../../../utils/date';
import { apiRequest } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth-store';
import { User } from '@nutriapp/shared';
import { getInitials } from '../../../utils/name';
import { FormsNewAppointment } from '../../../components/app/forms-appointment';

interface Appointment {
  time: string;
  name: string;
  initials: string;
  type: string;
  kind: 'Particular' | 'Hospital';
  status: 'Confirmada' | 'Aguardando';
  tone: string;
}

interface TKpiCard {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  foot: React.ReactNode;
  action?: () => void;
}

interface TFallowup {
  initials: string;
  tone: string;
  name: string;
  detail: string;
  days: string;
  onClick: () => void;
}

type MeResponse = { nutricionista: User };

const initialAppointments: Appointment[] = [
  {
    time: '09:00',
    name: 'Mariana Costa',
    initials: 'MC',
    type: 'Retorno · 45 min',
    kind: 'Particular',
    status: 'Confirmada',
    tone: '',
  },
  {
    time: '10:00',
    name: 'Rafael Almeida',
    initials: 'RA',
    type: 'Primeira consulta · 60 min',
    kind: 'Particular',
    status: 'Confirmada',
    tone: 'alt1',
  },
  {
    time: '11:30',
    name: 'Camila Ferreira',
    initials: 'CF',
    type: 'Acompanhamento · 30 min',
    kind: 'Hospital',
    status: 'Aguardando',
    tone: 'alt2',
  },
  {
    time: '14:00',
    name: 'João Pedro Lima',
    initials: 'JL',
    type: 'Retorno · 45 min',
    kind: 'Particular',
    status: 'Confirmada',
    tone: 'alt3',
  },
];

const clinical = [
  { label: 'Eutrofia', count: 34, color: '#2d8057', percent: 28 },
  { label: 'Sobrepeso', count: 27, color: '#78b78c', percent: 22 },
  { label: 'Obesidade', count: 22, color: '#d8b76c', percent: 18 },
  { label: 'Baixo peso', count: 19, color: '#e59b79', percent: 16 },
  { label: 'Outros', count: 19, color: '#c4d4c8', percent: 16 },
];

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'Todos' | 'Particular' | 'Hospital'>(
    'Todos',
  );
  const [appointments, setAppointments] = useState(initialAppointments);
  const [notice, setNotice] = useState('');

  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);

  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);


  useEffect(() => {
    apiRequest<MeResponse>("/me").then(({ nutricionista }) => {
      setUser(nutricionista);
    }).catch((reason) => {
      toast.error(reason instanceof Error ? reason.message : "Faça login para acessar o perfil.");
    }).finally(() => {
      setLoading(false);
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setConfig({
      title: "Visão Geral",
      subtitle: getCurrentDay(),
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

  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (filter === 'Todos' || a.kind === filter) &&
          a.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [appointments, filter, query],
  );

  const weekLabel =
    weekOffset === 0
      ? '19 — 23 out, 2026'
      : weekOffset > 0
        ? '26 — 30 out, 2026'
        : '12 — 16 out, 2026';



  const goTo = (href: string) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen">
      <main className="main">
        <div className="content">
          {notice && (
            <div
              role="status"
              className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#d7eadb] bg-[#edf8ef] px-4 py-3 text-[12px] text-[#2d6846]"
            >
              <span className="flex items-center gap-2">
                <Check size={15} />
                {notice}
              </span>
              <button onClick={() => setNotice('')} aria-label="Fechar aviso">
                <X size={15} />
              </button>
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[25px] font-bold tracking-[-1px]">
                Bom dia, {user?.nome}.
              </h1>
              <p className="mt-1.5 text-[12px] text-[#7e8c82]">
                Aqui está o resumo da sua clínica para hoje.
              </p>
            </div>
          </div>

          {/* KpiCard */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<CalendarDays size={17} />}
              iconBg="bg-[#e9f5ed] text-[#2d8057]"
              label="Consultas nesta semana"
              value="18"
              foot={
                <>
                  <span className="font-semibold text-[#328258]">+3</span>
                  <span> em relação à semana passada</span>
                </>
              }
            />
            <KpiCard
              icon={<Users size={17} />}
              iconBg="bg-[#edf1fa] text-[#5e79a9]"
              label="Pacientes ativos"
              value="121"
              foot={
                <>
                  <span className="font-semibold text-[#328258]">8 novos</span>
                  <span> neste mês</span>
                </>
              }
            />
            <KpiCard
              icon={<CircleAlert size={17} />}
              iconBg="bg-[#fff3e5] text-[#b77b30]"
              label="Faltas para acompanhar"
              value="3"
              foot={
                <>
                  <span className="font-semibold text-[#ad7838]">
                    2 sem retorno
                  </span>
                  <span> há mais de 7 dias</span>
                </>
              }
              action={() =>
                document
                  .getElementById('followups')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            />
            <KpiCard
              icon={<Wallet size={17} />}
              iconBg="bg-[#f2ebf6] text-[#8b66a0]"
              label="Receita recebida no mês"
              value="R$ 8.450"
              foot={
                <>
                  <ArrowUpRight size={13} className="text-[#328258]" />
                  <span className="font-semibold text-[#328258]">12,4%</span>
                  <span> vs. mês anterior</span>
                </>
              }
            />
          </section>

          {/* Agenda da semana */}
          <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,1fr)]">
            <div className="panel p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="section-title">Agenda da semana</h2>
                  <p className="section-subtitle">
                    Seus próximos atendimentos e compromissos
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-md border border-[#e9eee9] p-1.5 text-[#78877e]"
                    aria-label="Semana anterior"
                    onClick={() => setWeekOffset((v) => Math.max(-1, v - 1))}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-2 text-[10px] font-semibold text-[#637369]">
                    {weekLabel}
                  </span>
                  <button
                    className="rounded-md border border-[#e9eee9] p-1.5 text-[#78877e]"
                    aria-label="Próxima semana"
                    onClick={() => setWeekOffset((v) => Math.min(1, v + 1))}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
              <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
                {[
                  { d: 'SEG', n: '19', active: true },
                  { d: 'TER', n: '20' },
                  { d: 'QUA', n: '21' },
                  { d: 'QUI', n: '22' },
                  { d: 'SEX', n: '23' },
                ].map((day) => (
                  <button
                    key={day.d}
                    onClick={() =>
                      setNotice(
                        `${day.d}, ${day.n} de outubro: agenda de demonstração selecionada.`,
                      )
                    }
                    className={`min-w-[51px] flex-1 rounded-lg border px-2 py-2.5 text-center ${day.active ? 'border-[#2d8057] bg-[#eaf5ed]' : 'border-[#edf1ed] bg-white hover:bg-[#f7faf7]'}`}
                  >
                    <div
                      className={`text-[9px] font-bold tracking-wide ${day.active ? 'text-[#2d8057]' : 'text-[#9aa69e]'}`}
                    >
                      {day.d}
                    </div>
                    <div
                      className={`mt-1 text-[15px] font-bold ${day.active ? 'text-[#245c3d]' : 'text-[#516459]'}`}
                    >
                      {day.n}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-[#5f7065]">
                  {getCurrentDayWithoutYear()}
                </div>
                <div className="flex gap-1">
                  {(['Todos', 'Particular', 'Hospital'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-md px-2 py-1.5 text-[9px] font-semibold ${filter === f ? 'bg-[#eaf5ed] text-[#2b754e]' : 'text-[#89968d] hover:bg-[#f5f8f5]'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {filteredAppointments.length ? (
                  filteredAppointments.map((a, i) => (
                    <div key={`${a.name}-${a.time}`} className="table-row">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className={`avatar ${a.tone}`}>{a.initials}</div>
                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-bold text-[#334a3b]">
                            {a.name}
                          </div>
                          <div className="mt-1 truncate text-[10px] text-[#8b978f]">
                            {a.type}
                          </div>
                        </div>
                      </div>
                      <div className="hide-mobile">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#516459]">
                          <Clock3 size={12} className="text-[#9aa69e]" />
                          {a.time}
                        </div>
                        <div className="mt-1 text-[9px] text-[#9aa69e]">
                          {a.kind}
                        </div>
                      </div>
                      <div className="hide-mobile">
                        <span
                          className={`pill ${a.status === 'Confirmada' ? 'bg-[#eaf5ed] text-[#34774f]' : 'bg-[#fff3e4] text-[#a87534]'}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${a.status === 'Confirmada' ? 'bg-[#4b9868]' : 'bg-[#d7a04e]'}`}
                          />
                          {a.status}
                        </span>
                      </div>
                      <button
                        aria-label={`Opções para ${a.name}`}
                        onClick={() =>
                          setNotice(
                            `Atendimento de ${a.name}: abra o prontuário para ver detalhes.`,
                          )
                        }
                        className="justify-self-end rounded-md p-1.5 text-[#9ba69e] hover:bg-[#f5f8f5]"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-9 text-center text-[12px] text-[#87948b]">
                    Nenhum atendimento encontrado para essa busca.
                  </div>
                )}
              </div>
              <button
                onClick={() => goTo('/app/agenda')}
                className="mt-4 flex w-full items-center justify-center gap-1.5 border-t border-[#eef2ee] pt-4 text-[11px] font-bold text-[#2d8057]"
              >
                Ver agenda completa <ArrowRight size={13} />
              </button>
            </div>

            <div className="panel p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="section-title">
                    Perfil clínico dos pacientes
                  </h2>
                  <p className="section-subtitle">
                    Distribuição por classificação registrada
                  </p>
                </div>
                <button
                  onClick={() => goTo('/app/relatorios')}
                  aria-label="Mais detalhes clínicos"
                  className="rounded-md p-1.5 text-[#94a097] hover:bg-[#f5f8f5]"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 py-1 sm:gap-7">
                <div className="chart-donut">
                  <div className="donut-center">
                    <span className="text-[26px] font-bold tracking-[-1px]">
                      121
                    </span>
                    <span className="mt-0.5 text-[9px] text-[#8b978f]">
                      pacientes
                    </span>
                  </div>
                </div>
                <div className="min-w-[145px] flex-1 space-y-3">
                  {clinical.map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                      />
                      <span className="flex-1 text-[10px] text-[#6e7e73]">
                        {c.label}
                      </span>
                      <span className="text-[11px] font-bold text-[#344b3c]">
                        {c.count}
                      </span>
                      <span className="w-7 text-right text-[9px] text-[#9ba69e]">
                        {c.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-[#f6f9f6] p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-white p-2 text-[#3c8058]">
                    <Activity size={15} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#3b5d46]">
                      Visão para acompanhamento
                    </div>
                    <p className="mt-1 text-[10px] leading-[1.6] text-[#829087]">
                      34 pacientes estão classificados como eutróficos. Consulte
                      a evolução individual antes de definir condutas.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => goTo('/app/pacientes')}
                className="mt-4 flex w-full items-center justify-center gap-1.5 border-t border-[#eef2ee] pt-4 text-[11px] font-bold text-[#2d8057]"
              >
                Explorar pacientes <ArrowRight size={13} />
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)]">
            <div className="panel p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="section-title">Resumo financeiro</h2>
                  <p className="section-subtitle">
                    Acompanhamento de recebimentos · atendimentos particulares
                  </p>
                </div>
                <button
                  onClick={() => goTo('/app/financeiro')}
                  className="btn-secondary"
                >
                  Ver financeiro <ArrowRight size={12} />
                </button>
              </div>
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#edf1ed] p-3.5">
                  <div className="text-[10px] text-[#849188]">
                    Recebido em outubro
                  </div>
                  <div className="mt-2 text-[19px] font-bold tracking-[-.7px]">
                    R$ 8.450
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-[#328258]">
                    <ArrowUpRight size={12} />
                    12,4% vs. setembro
                  </div>
                </div>
                <div className="rounded-xl border border-[#edf1ed] p-3.5">
                  <div className="text-[10px] text-[#849188]">
                    Previsão do mês
                  </div>
                  <div className="mt-2 text-[19px] font-bold tracking-[-.7px]">
                    R$ 11.200
                  </div>
                  <div className="mt-1 text-[9px] text-[#849188]">
                    75% da meta mensal
                  </div>
                </div>
                <div className="rounded-xl border border-[#edf1ed] p-3.5">
                  <div className="text-[10px] text-[#849188]">
                    Recebido em setembro
                  </div>
                  <div className="mt-2 text-[19px] font-bold tracking-[-.7px]">
                    R$ 7.520
                  </div>
                  <div className="mt-1 text-[9px] text-[#849188]">
                    Mês anterior fechado
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-3 border-t border-[#eef2ee] pt-4">
                <div className="flex w-12 flex-col justify-end gap-1 pb-1 text-[9px] text-[#a0aaa3]">
                  <span>12k</span>
                  <span>8k</span>
                  <span>4k</span>
                  <span>0</span>
                </div>
                <div className="flex flex-1 items-end justify-between gap-2">
                  {[
                    { m: 'Mai', h: 55 },
                    { m: 'Jun', h: 63 },
                    { m: 'Jul', h: 49 },
                    { m: 'Ago', h: 72 },
                    { m: 'Set', h: 61 },
                    { m: 'Out', h: 89 },
                  ].map((b) => (
                    <div key={b.m} className="fin-bar">
                      <div
                        className={`fin-bar-inner ${b.m === 'Out' ? 'current' : ''}`}
                        style={{ height: `${b.h}%` }}
                      />
                      <span
                        className={`text-[9px] ${b.m === 'Out' ? 'font-bold text-[#2d8057]' : 'text-[#9aa69e]'}`}
                      >
                        {b.m}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[9px] leading-[1.5] text-[#9aa69e]">
                Valores ilustrativos. A previsão considera atendimentos
                particulares agendados; não inclui pacientes hospitalares sem
                cobrança direta.
              </p>
            </div>

            <div id="followups" className="panel p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="section-title">Precisam de atenção</h2>
                  <p className="section-subtitle">
                    Faltas e retornos pendentes
                  </p>
                </div>
                <span className="pill bg-[#fff3e4] text-[#a87534]">
                  3 pendências
                </span>
              </div>
              <div className="space-y-4">
                <Followup
                  initials="LC"
                  tone="alt1"
                  name="Lucas Carvalho"
                  detail="Faltou em 15 out. · Retorno"
                  days="4 dias"
                  onClick={() =>
                    setNotice(
                      'Lucas Carvalho: revisar histórico e entrar em contato antes de reagendar.',
                    )
                  }
                />
                <Followup
                  initials="BF"
                  tone="alt2"
                  name="Beatriz Freitas"
                  detail="Faltou em 12 out. · Consulta"
                  days="7 dias"
                  onClick={() =>
                    setNotice(
                      'Beatriz Freitas: revisar histórico e entrar em contato antes de reagendar.',
                    )
                  }
                />
                <Followup
                  initials="MS"
                  tone="alt3"
                  name="Mateus Silva"
                  detail="Sem retorno agendado"
                  days="9 dias"
                  onClick={() =>
                    setNotice(
                      'Mateus Silva: verificar plano de acompanhamento e necessidade de retorno.',
                    )
                  }
                />
              </div>
              <button
                onClick={() =>
                  setNotice(
                    'Lista de faltas filtrada. Os dados são fictícios neste protótipo.',
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e8eee9] py-2.5 text-[11px] font-bold text-[#516b5b] hover:bg-[#f7faf7]"
              >
                Ver todas as pendências <ArrowRight size={13} />
              </button>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#fff9ef] p-3 text-[10px] leading-[1.5] text-[#987642]">
                <CircleAlert size={14} className="mt-0.5 shrink-0" />
                Priorize um contato acolhedor; uma falta não significa
                necessariamente abandono do tratamento.
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon, iconBg, label, value, foot, action }: TKpiCard) {
  return (
    <div
      onClick={action}
      className={`panel p-4 ${action ? 'cursor-pointer transition-shadow hover:shadow-sm' : ''}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="kpi-label">{label}</div>
        <div
          className={`grid h-8 w-8 place-items-center rounded-[10px] ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[9px] text-[#8b978f]">
        {foot}
      </div>
    </div>
  );
}

function Followup({ initials, tone, name, detail, days, onClick }: TFallowup) {
  return (
    <div className="flex items-center gap-3">
      <div className={`avatar ${tone}`}>{initials}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-bold text-[#3a5141]">
          {name}
        </div>
        <div className="mt-1 truncate text-[10px] text-[#8b978f]">{detail}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-[9px] text-[#9ba69e]">{days}</span>
        <button
          onClick={onClick}
          className="text-[10px] font-bold text-[#2d8057] hover:underline"
        >
          Revisar
        </button>
      </div>
    </div>
  );
}
