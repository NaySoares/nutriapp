'use client';

import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
  TrendingUp,
  CircleAlert,
  RotateCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { SideBar } from '../../../components/layout/sidebar';

type EntryStatus = 'Recebido' | 'Pendente' | 'Atrasado';
type EntryType = 'Consulta' | 'Plano alimentar' | 'Retorno';
interface Entry {
  id: number;
  patient: string;
  initials: string;
  description: EntryType;
  date: string;
  dueDate: string;
  amount: number;
  status: EntryStatus;
  method: string;
  kind: 'Particular' | 'Hospitalar';
}

const initialEntries: Entry[] = [
  {
    id: 1,
    patient: 'Mariana Costa',
    initials: 'MC',
    description: 'Consulta',
    date: '19/10/2026',
    dueDate: '19/10/2026',
    amount: 220,
    status: 'Recebido',
    method: 'Pix',
    kind: 'Particular',
  },
  {
    id: 2,
    patient: 'Rafael Almeida',
    initials: 'RA',
    description: 'Retorno',
    date: '19/10/2026',
    dueDate: '19/10/2026',
    amount: 0,
    status: 'Recebido',
    method: 'Incluso no pacote',
    kind: 'Particular',
  },
  {
    id: 3,
    patient: 'João Pedro Lima',
    initials: 'JL',
    description: 'Consulta',
    date: '17/10/2026',
    dueDate: '17/10/2026',
    amount: 220,
    status: 'Atrasado',
    method: '—',
    kind: 'Particular',
  },
  {
    id: 4,
    patient: 'Beatriz Santos',
    initials: 'BS',
    description: 'Plano alimentar',
    date: '16/10/2026',
    dueDate: '23/10/2026',
    amount: 180,
    status: 'Pendente',
    method: 'A combinar',
    kind: 'Particular',
  },
  {
    id: 5,
    patient: 'Camila Ferreira',
    initials: 'CF',
    description: 'Consulta',
    date: '15/10/2026',
    dueDate: '15/10/2026',
    amount: 250,
    status: 'Recebido',
    method: 'Cartão',
    kind: 'Particular',
  },
  {
    id: 6,
    patient: 'Lucas Martins',
    initials: 'LM',
    description: 'Consulta',
    date: '14/10/2026',
    dueDate: '—',
    amount: 0,
    status: 'Recebido',
    method: 'Faturamento institucional',
    kind: 'Hospitalar',
  },
  {
    id: 7,
    patient: 'Pedro Henrique Silva',
    initials: 'PS',
    description: 'Consulta',
    date: '12/10/2026',
    dueDate: '20/10/2026',
    amount: 200,
    status: 'Pendente',
    method: 'Pix',
    kind: 'Particular',
  },
  {
    id: 8,
    patient: 'Fernanda Oliveira',
    initials: 'FO',
    description: 'Retorno',
    date: '08/10/2026',
    dueDate: '08/10/2026',
    amount: 160,
    status: 'Atrasado',
    method: '—',
    kind: 'Particular',
  },
  {
    id: 9,
    patient: 'Gabriel Nunes',
    initials: 'GN',
    description: 'Consulta',
    date: '06/10/2026',
    dueDate: '06/10/2026',
    amount: 220,
    status: 'Recebido',
    method: 'Pix',
    kind: 'Particular',
  },
  {
    id: 10,
    patient: 'Isabela Rocha',
    initials: 'IR',
    description: 'Plano alimentar',
    date: '02/10/2026',
    dueDate: '25/10/2026',
    amount: 180,
    status: 'Pendente',
    method: 'A combinar',
    kind: 'Particular',
  },
];

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinancePage() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos os status');
  const [typeFilter, setTypeFilter] = useState('Todos os atendimentos');
  const [month, setMonth] = useState('2026-10');
  const [sortByAmount, setSortByAmount] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newPatient, setNewPatient] = useState('');
  const [newAmount, setNewAmount] = useState('220');
  const [newDate, setNewDate] = useState('2026-10-19');
  const [newType, setNewType] = useState<EntryType>('Consulta');
  const [newKind, setNewKind] = useState<'Particular' | 'Hospitalar'>(
    'Particular',
  );
  const [newStatus, setNewStatus] = useState<EntryStatus>('Pendente');

  const filteredEntries = useMemo(
    () =>
      entries
        .filter(
          (entry) =>
            !query.trim() ||
            entry.patient
              .toLocaleLowerCase('pt-BR')
              .includes(query.trim().toLocaleLowerCase('pt-BR')),
        )
        .filter(
          (entry) =>
            statusFilter === 'Todos os status' || entry.status === statusFilter,
        )
        .filter(
          (entry) =>
            typeFilter === 'Todos os atendimentos' || entry.kind === typeFilter,
        )
        .sort((a, b) => (sortByAmount ? b.amount - a.amount : b.id - a.id)),
    [entries, query, statusFilter, typeFilter, sortByAmount],
  );

  const received = entries
    .filter(
      (entry) => entry.status === 'Recebido' && entry.kind === 'Particular',
    )
    .reduce((sum, entry) => sum + entry.amount, 0);
  const pending = entries
    .filter(
      (entry) => entry.status === 'Pendente' && entry.kind === 'Particular',
    )
    .reduce((sum, entry) => sum + entry.amount, 0);
  const overdue = entries
    .filter(
      (entry) => entry.status === 'Atrasado' && entry.kind === 'Particular',
    )
    .reduce((sum, entry) => sum + entry.amount, 0);
  const expected = received + pending;
  const receivedCount = entries.filter(
    (entry) =>
      entry.status === 'Recebido' &&
      entry.kind === 'Particular' &&
      entry.amount > 0,
  ).length;
  const pendingCount = entries.filter(
    (entry) => entry.status === 'Pendente' && entry.kind === 'Particular',
  ).length;
  const overdueCount = entries.filter(
    (entry) => entry.status === 'Atrasado' && entry.kind === 'Particular',
  ).length;
  const hasFilters =
    query.trim() !== '' ||
    statusFilter !== 'Todos os status' ||
    typeFilter !== 'Todos os atendimentos';

  function clearFilters() {
    setQuery('');
    setStatusFilter('Todos os status');
    setTypeFilter('Todos os atendimentos');
  }
  function showToast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  }
  function markReceived(entry: Entry) {
    setEntries((current) =>
      current.map((item) =>
        item.id === entry.id
          ? {
              ...item,
              status: 'Recebido',
              method:
                item.method === '—' || item.method === 'A combinar'
                  ? 'Pix'
                  : item.method,
            }
          : item,
      ),
    );
    showToast(`${entry.patient}: lançamento marcado como recebido.`);
  }
  function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPatient.trim() || Number(newAmount) < 0) return;
    const initials = newPatient
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
    const dateParts = newDate.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    setEntries((current) => [
      {
        id: Date.now(),
        patient: newPatient.trim(),
        initials,
        description: newType,
        date: formattedDate,
        dueDate: formattedDate,
        amount: Number(newAmount),
        status: newStatus,
        method: newStatus === 'Recebido' ? 'Pix' : 'A combinar',
        kind: newKind,
      },
      ...current,
    ]);
    setQuery(newPatient.trim());
    setShowAddModal(false);
    setNewPatient('');
    setNewAmount('220');
    showToast('Lançamento adicionado à demonstração.');
  }

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-[#263b30]">
      {mobileNavOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <SideBar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

      <main className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu rounded-lg border border-[#e8eee9] p-2 text-[#496354]"
              aria-label="Abrir menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Wallet size={18} />
            </button>
            <div>
              <div className="text-[11px] text-[#849188]">
                Segunda-feira, 19 de outubro de 2026
              </div>
              <div className="mt-1 text-[17px] font-bold tracking-[-.45px]">
                Financeiro
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-[#e7ece7] bg-white px-3 py-2.5 text-[11px] text-[#718278] sm:flex">
              <CalendarDays size={14} />
              <span>Outubro de 2026</span>
            </div>
            <button
              aria-label="Notificações"
              onClick={() =>
                showToast(
                  overdueCount
                    ? `Há ${overdueCount} lançamentos atrasados para revisar.`
                    : 'Nenhum lançamento atrasado.',
                )
              }
              className="relative rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"
            >
              <Bell size={16} />
              {overdueCount > 0 && (
                <span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#d9a354] ring-2 ring-white" />
              )}
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={15} />
              Novo lançamento
            </button>
          </div>
        </header>

        <div className="content">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
                SAÚDE FINANCEIRA DO CONSULTÓRIO
              </div>
              <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
                Seu financeiro, em perspectiva
              </h1>
              <p className="mt-1 max-w-[620px] text-[12px] leading-5 text-[#7d8b83]">
                Veja o que já entrou, o que está previsto e quais pagamentos
                precisam de atenção.
              </p>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-[#e4eae4] bg-white px-3 py-2.5 text-[11px] text-[#6e7e73]">
              <CalendarDays size={14} />
              <select
                aria-label="Selecionar mês"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  showToast(
                    'O seletor de mês está demonstrativo; os dados de exemplo permanecem no mesmo período.',
                  );
                }}
                className="bg-transparent outline-none"
              >
                <option value="2026-10">Outubro de 2026</option>
                <option value="2026-09">Setembro de 2026</option>
                <option value="2026-08">Agosto de 2026</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </div>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-[#7d8b83]">
                  Recebido no mês
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f5ed] text-[#287653]">
                  <Wallet size={16} />
                </div>
              </div>
              <div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">
                {money(received)}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#287653]">
                <ArrowUpRight size={13} />
                Valores particulares recebidos
              </div>
            </div>
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-[#7d8b83]">
                  Previsão de recebimento
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf2fa] text-[#5576a3]">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">
                {money(expected)}
              </div>
              <div className="mt-2 text-[10px] text-[#7d8b83]">
                Recebido + pagamentos pendentes
              </div>
            </div>
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-[#7d8b83]">
                  A receber
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff5e6] text-[#a8752c]">
                  <Clock3 size={16} />
                </div>
              </div>
              <div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">
                {money(pending)}
              </div>
              <div className="mt-2 text-[10px] text-[#7d8b83]">
                {pendingCount}{' '}
                {pendingCount === 1
                  ? 'lançamento pendente'
                  : 'lançamentos pendentes'}
              </div>
            </div>
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-[#7d8b83]">
                  Pagamentos atrasados
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fbeceb] text-[#b85c52]">
                  <CircleAlert size={16} />
                </div>
              </div>
              <div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">
                {money(overdue)}
              </div>
              <div className="mt-2 text-[10px] text-[#b85c52]">
                {overdueCount}{' '}
                {overdueCount === 1
                  ? 'lançamento para revisar'
                  : 'lançamentos para revisar'}
              </div>
            </div>
          </section>

          <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
            <div className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="section-title">Entradas do mês</h2>
                  <p className="section-subtitle">
                    Valores recebidos por atendimento particular
                  </p>
                </div>
                <span className="rounded-lg bg-[#f3f7f3] px-2.5 py-1.5 text-[10px] font-semibold text-[#64806d]">
                  Outubro · 2026
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[25px] font-bold tracking-[-1px]">
                    {money(received)}
                  </div>
                  <div className="mt-1 text-[10px] text-[#87948b]">
                    Total recebido no período de demonstração
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#287653]">
                  <ArrowUpRight size={13} />
                  Entradas registradas
                </div>
              </div>
              <div className="mt-5 grid h-[105px] grid-cols-7 items-end gap-2 sm:gap-4">
                {[
                  { day: '01–04', v: 34 },
                  { day: '05–08', v: 62 },
                  { day: '09–12', v: 48 },
                  { day: '13–16', v: 82 },
                  { day: '17–20', v: 100 },
                  { day: '21–24', v: 15 },
                  { day: '25–31', v: 8 },
                ].map((bar) => (
                  <div
                    key={bar.day}
                    className="flex h-full flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-[82px] w-full items-end overflow-hidden rounded-t-md bg-[#f0f5f0]">
                      <div
                        title={`${bar.day}: indicador ilustrativo`}
                        className="w-full rounded-t-md bg-[#76aa88] transition-all"
                        style={{ height: `${bar.v}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-[#96a198]">{bar.day}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[9px] text-[#9aa59d]">
                Visualização ilustrativa; não representa uma série contábil
                real.
              </p>
            </div>
            <div className="panel p-5">
              <div>
                <h2 className="section-title">Resumo de recebimentos</h2>
                <p className="section-subtitle">
                  Situação dos lançamentos particulares
                </p>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-[#607168]">
                      <span className="h-2 w-2 rounded-full bg-[#5c9c73]" />
                      Recebido
                    </span>
                    <span className="font-semibold text-[#304638]">
                      {money(received)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf2ed]">
                    <div
                      className="h-full rounded-full bg-[#5c9c73]"
                      style={{
                        width: `${expected ? (received / expected) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-[#607168]">
                      <span className="h-2 w-2 rounded-full bg-[#d6a452]" />
                      Pendente
                    </span>
                    <span className="font-semibold text-[#304638]">
                      {money(pending)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf2ed]">
                    <div
                      className="h-full rounded-full bg-[#d6a452]"
                      style={{
                        width: `${expected ? (pending / expected) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-[#607168]">
                      <span className="h-2 w-2 rounded-full bg-[#c86f64]" />
                      Atrasado
                    </span>
                    <span className="font-semibold text-[#304638]">
                      {money(overdue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf2ed]">
                    <div
                      className="h-full rounded-full bg-[#c86f64]"
                      style={{
                        width: `${expected + overdue ? (overdue / (expected + overdue)) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-[#f7f9f6] p-3">
                <div className="flex items-start gap-2">
                  <CircleAlert
                    size={15}
                    className="mt-0.5 shrink-0 text-[#b1813e]"
                  />
                  <div>
                    <div className="text-[11px] font-semibold text-[#52675a]">
                      Próxima ação recomendada
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-[#87948b]">
                      Revise os pagamentos atrasados e confirme o contexto antes
                      de enviar lembretes.
                    </p>
                    <button
                      onClick={() => {
                        setStatusFilter('Atrasado');
                        setShowFilters(true);
                      }}
                      className="mt-2 text-[10px] font-bold text-[#287653]"
                    >
                      Revisar atrasos →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-[#edf1ed] p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="section-title">Lançamentos financeiros</h2>
                  <p className="section-subtitle">
                    Acompanhe os pagamentos e atualize o status de cada
                    lançamento
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2.5 text-[#98a39b] sm:w-[240px]">
                    <Search size={15} />
                    <input
                      aria-label="Buscar por paciente"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar paciente..."
                      className="w-full bg-transparent text-[12px] text-[#304638] outline-none placeholder:text-[#9ba69e]"
                    />
                  </label>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowFilters((current) => !current)}
                  >
                    <SlidersHorizontal size={14} />
                    Filtros
                    <ChevronDown
                      size={13}
                      className={showFilters ? 'rotate-180' : ''}
                    />
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      showToast(
                        'Exportação disponível na versão integrada com dados reais.',
                      )
                    }
                  >
                    <Download size={14} />
                    Exportar
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#78877e]">
                  <Filter size={13} />
                  Status:
                </span>
                {['Todos os status', 'Recebido', 'Pendente', 'Atrasado'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition-colors ${statusFilter === status ? 'bg-[#e7f2e9] text-[#287653]' : 'border border-[#e7ece7] bg-white text-[#718278] hover:bg-[#f7f9f6]'}`}
                    >
                      {status}
                    </button>
                  ),
                )}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 px-2 py-2 text-[10px] font-semibold text-[#287653]"
                  >
                    <RotateCcw size={12} />
                    Limpar filtros
                  </button>
                )}
              </div>
              {showFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-[#f6f9f6] p-3">
                  <label className="text-[10px] text-[#718278]">
                    Tipo de atendimento{' '}
                    <select
                      value={typeFilter}
                      onChange={(event) => setTypeFilter(event.target.value)}
                      className="ml-2 rounded-lg border border-[#e3eae4] bg-white px-2.5 py-2 text-[11px] text-[#53665a] outline-none"
                    >
                      <option>Todos os atendimentos</option>
                      <option>Particular</option>
                      <option>Hospitalar</option>
                    </select>
                  </label>
                  <button
                    onClick={() => setSortByAmount((current) => !current)}
                    className="rounded-lg border border-[#e3eae4] bg-white px-3 py-2 text-[10px] font-semibold text-[#53665a]"
                  >
                    Ordenar por valor {sortByAmount ? '↓' : '↕'}
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[830px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#fafcf9] text-[10px] font-semibold uppercase tracking-[.65px] text-[#87948b]">
                    <th className="px-5 py-3">Paciente / descrição</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f0]">
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="group transition-colors hover:bg-[#fbfdfb]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf4ee] text-[10px] font-bold text-[#4e8060]">
                            {entry.initials}
                          </span>
                          <span>
                            <span className="block whitespace-nowrap text-[11px] font-semibold text-[#304638]">
                              {entry.patient}
                            </span>
                            <span className="mt-1 block text-[10px] text-[#8a978f]">
                              {entry.description}
                              <span className="mx-1.5 text-[#c3ccc5]">·</span>
                              {entry.kind}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#718278]">
                        {entry.date}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#718278]">
                        {entry.dueDate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold text-[#304638]">
                        {money(entry.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#718278]">
                        {entry.method}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`pill ${entry.status === 'Recebido' ? 'bg-[#e9f5ed] text-[#287653]' : entry.status === 'Pendente' ? 'bg-[#fff5e6] text-[#a8752c]' : 'bg-[#fbeceb] text-[#b85c52]'}`}
                        >
                          {entry.status === 'Recebido' ? (
                            <CheckCircle2 size={11} />
                          ) : entry.status === 'Pendente' ? (
                            <Clock3 size={11} />
                          ) : (
                            <CircleAlert size={11} />
                          )}
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {entry.status !== 'Recebido' &&
                        entry.kind === 'Particular' ? (
                          <button
                            onClick={() => markReceived(entry)}
                            className="whitespace-nowrap rounded-lg border border-[#dce9df] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#287653] hover:bg-[#edf7ef]"
                          >
                            Marcar recebido
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#a1aca5]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEntries.length === 0 && (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5ef] text-[#4c8965]">
                    <Search size={20} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#304638]">
                    Nenhum lançamento encontrado
                  </h3>
                  <p className="mt-1 text-[12px] text-[#87948b]">
                    Tente outro nome ou ajuste os filtros.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[12px] font-semibold text-[#287653]"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-[#edf1ed] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-[#87948b]">
                Exibindo{' '}
                <span className="font-semibold text-[#53665a]">
                  {filteredEntries.length}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-[#53665a]">
                  {entries.length}
                </span>{' '}
                lançamentos
              </p>
              <p className="text-[10px] text-[#9aa59d]">
                Dados fictícios para prototipação; não representam um extrato
                contábil.
              </p>
            </div>
          </section>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#e8eee9] bg-white p-3.5">
            <CircleAlert size={15} className="mt-0.5 shrink-0 text-[#819087]" />
            <p className="text-[10px] leading-5 text-[#87948b]">
              Os atendimentos hospitalares aparecem na lista para contexto
              operacional, mas não entram nos totais de receita particular. Em
              produção, configure separadamente faturamento institucional,
              taxas, estornos, impostos e conciliação para que a previsão
              financeira seja confiável.
            </p>
          </div>
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

      {showAddModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-entry-title"
            className="my-auto w-full max-w-[500px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
                  FINANCEIRO
                </div>
                <h2
                  id="new-entry-title"
                  className="text-[20px] font-bold tracking-[-.5px] text-[#20352c]"
                >
                  Novo lançamento
                </h2>
                <p className="mt-1 text-[11px] text-[#87948b]">
                  Registre um valor para acompanhar na demonstração.
                </p>
              </div>
              <button
                aria-label="Fechar"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-[#87948b] hover:bg-[#f5f8f5]"
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={addEntry} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                  Nome do paciente / referência{' '}
                  <span className="text-[#b65c50]">*</span>
                </span>
                <input
                  required
                  autoFocus
                  value={newPatient}
                  onChange={(event) => setNewPatient(event.target.value)}
                  placeholder="Ex.: Ana Carolina Souza"
                  className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Valor (R$)
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={newAmount}
                    onChange={(event) => setNewAmount(event.target.value)}
                    className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Data do lançamento
                  </span>
                  <input
                    required
                    type="date"
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                    className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Descrição
                  </span>
                  <select
                    value={newType}
                    onChange={(event) =>
                      setNewType(event.target.value as EntryType)
                    }
                    className="w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  >
                    <option>Consulta</option>
                    <option>Retorno</option>
                    <option>Plano alimentar</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Tipo de atendimento
                  </span>
                  <select
                    value={newKind}
                    onChange={(event) =>
                      setNewKind(
                        event.target.value as 'Particular' | 'Hospitalar',
                      )
                    }
                    className="w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  >
                    <option>Particular</option>
                    <option>Hospitalar</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                  Status inicial
                </span>
                <select
                  value={newStatus}
                  onChange={(event) =>
                    setNewStatus(event.target.value as EntryStatus)
                  }
                  className="w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                >
                  <option>Recebido</option>
                  <option>Pendente</option>
                  <option>Atrasado</option>
                </select>
              </label>
              <p className="rounded-lg bg-[#f6f9f6] p-3 text-[10px] leading-4 text-[#7d8b83]">
                Este protótipo guarda alterações apenas no estado da página.
                Totais são calculados a partir dos lançamentos demonstrativos.
              </p>
              <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  Adicionar lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 20;
          display: flex;
          width: 238px;
          flex-direction: column;
          border-right: 1px solid #e9eee9;
          background: #fff;
          padding: 27px 17px 18px;
        }
        .main {
          min-height: 100vh;
          margin-left: 238px;
        }
        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          min-height: 74px;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid #e9eee9;
          background: rgba(255, 255, 255, 0.94);
          padding: 14px 30px;
          backdrop-filter: blur(12px);
        }
        .content {
          margin: 0 auto;
          max-width: 1450px;
          padding: 28px 30px 42px;
        }
        .brand-mark {
          display: grid;
          width: 37px;
          height: 37px;
          place-items: center;
          border-radius: 12px;
          background: #e7f2e9;
          color: #287653;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          border-radius: 9px;
          padding: 10px 12px;
          color: #7d8b83;
          font-size: 12px;
          font-weight: 500;
          transition:
            background 0.15s,
            color 0.15s;
        }
        .nav-item:hover {
          background: #f6f9f6;
          color: #365b43;
        }
        .nav-item.active {
          background: #eaf4ec;
          color: #287653;
          font-weight: 700;
        }
        .panel {
          border: 1px solid #e8eee9;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(29, 56, 38, 0.015);
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.2px;
          color: #304638;
        }
        .section-subtitle {
          margin-top: 4px;
          font-size: 10px;
          color: #87948b;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          white-space: nowrap;
          border: 1px solid #287653;
          border-radius: 9px;
          background: #287653;
          padding: 10px 13px;
          color: #fff;
          font-size: 11px;
          font-weight: 650;
          transition: background 0.15s;
        }
        .btn-primary:hover {
          background: #1f6445;
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          white-space: nowrap;
          border: 1px solid #e3eae4;
          border-radius: 9px;
          background: #fff;
          padding: 9px 11px;
          color: #617267;
          font-size: 11px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .btn-secondary:hover {
          background: #f7f9f6;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 9px;
          font-weight: 650;
        }
        .mobile-menu {
          display: none;
        }
        @media (max-width: 767px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main {
            margin-left: 0;
          }
          .mobile-menu {
            display: inline-flex;
          }
          .topbar {
            padding: 12px 16px;
          }
          .content {
            padding: 22px 16px 32px;
          }
        }
        @media (min-width: 768px) and (max-width: 1100px) {
          .sidebar {
            width: 210px;
            padding-left: 13px;
            padding-right: 13px;
          }
          .main {
            margin-left: 210px;
          }
          .topbar {
            padding-left: 22px;
            padding-right: 22px;
          }
          .content {
            padding-left: 22px;
            padding-right: 22px;
          }
        }
      `}</style>
    </div>
  );
}
