'use client';

import {
  ArrowDownUp,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
  CircleAlert,
  Clock3,
  CheckCircle2,
  RotateCcw,
  Eye,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useModalStore } from '../../../stores/modal-store';
import { useHeaderStore } from '../../../stores/header-store';
import { FormsNewPatient } from '../../../components/app/forms-patient';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import { PatientRecord } from '@nutriapp/shared';
import { getInitials } from '../../../utils/name';
import { useRouter } from 'next/navigation';
import { FormsNewAppointment } from '../../../components/app/forms-appointment';
import { usePatientStore } from '../../../stores/patient-store';
import { Button } from '../../../components/ui/button';
import { useAppointmentContext } from '../../../stores/appointment-store';

type CareType = 'Particular' | 'Hospitalar';
type PatientStatus = 'Ativo' | 'Retorno pendente' | 'Inativo';
type ClinicalStatus =
  | 'Eutrofia'
  | 'Sobrepeso'
  | 'Obesidade'
  | 'Baixo peso'
  | 'Acompanhamento clínico';

// const initialPatients: = [
//   {
//     id: 1,
//     name: 'Mariana Costa',
//     email: 'mariana.costa@email.com',
//     phone: '(91) 98812-3401',
//     initials: 'MC',
//     care: 'Particular',
//     clinical: 'Sobrepeso',
//     lastVisit: '16 out, 2026',
//     nextVisit: '23 out, 09:00',
//     status: 'Ativo',
//     tone: '',
//   }
// ];

const clinicalOptions: ClinicalStatus[] = [
  'Eutrofia',
  'Sobrepeso',
  'Obesidade',
  'Baixo peso',
  'Acompanhamento clínico',
];

type PatientsResponse = { pacientes: PatientRecord[] };

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [query, setQuery] = useState('');
  const [careFilter, setCareFilter] = useState('Todos');
  const [clinicalFilter, setClinicalFilter] = useState('Todas as condições');
  const [statusFilter, setStatusFilter] = useState('Todos os status');
  const [sortAZ, setSortAZ] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const setAppointmentPatient = useAppointmentContext((state) => state.setPatient);

  useEffect(() => {
    setConfig({
      title: "Pacientes",
      actions: (
        <button
          className="btn-primary"
          onClick={() => openModal(<FormsNewPatient onClose={() => { closeModal(); }} />)}
        >
          <Plus size={15} />
          Novo Paciente
        </button>
      )
    });

    return reset;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConfig, reset]);

  useEffect(() => {
    setLoading(true);
    apiRequest<PatientsResponse>("/patients").then((response) => {
      setPatients(response.pacientes);
    }).catch((reason) => {
      toast.error(reason instanceof Error ? reason.message : "Erro ao buscar dados.");
    }).finally(() => {
      setLoading(false);
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();

  const filteredPatients = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    return patients
      .filter(
        (patient) =>
          !normalizedQuery ||
          patient.nome.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
      )
      // .filter(
      //   (patient) => careFilter === 'Todos' || patient.care === careFilter,
      // )
      // .filter(
      //   (patient) =>
      //     clinicalFilter === 'Todas as condições' ||
      //     patient.clinical === clinicalFilter,
      // )
      // .filter(
      //   (patient) =>
      //     statusFilter === 'Todos os status' || patient.status === statusFilter,
      // )
      .sort((a, b) =>
        sortAZ
          ? a.nome.localeCompare(b.nome, 'pt-BR')
          : b.nome.localeCompare(a.nome, 'pt-BR'),
      );
  }, [patients, query, careFilter, clinicalFilter, statusFilter, sortAZ]);

  // const activeCount = patients.filter(
  //   (patient) => patient.status === 'Ativo',
  // ).length;
  // const pendingCount = patients.filter(
  //   (patient) => patient.status === 'Retorno pendente',
  // ).length;
  // const privateCount = patients.filter(
  //   (patient) => patient.care === 'Particular',
  // ).length;

  const activeCount = 3
  const pendingCount = 3
  const privateCount = 3

  const hasFilters =
    query.trim() !== '' ||
    careFilter !== 'Todos' ||
    clinicalFilter !== 'Todas as condições' ||
    statusFilter !== 'Todos os status';

  function resetFilters() {
    setQuery('');
    setCareFilter('Todos');
    setClinicalFilter('Todas as condições');
    setStatusFilter('Todos os status');
  }


  function markFollowUp(patient: PatientRecord) {
    setPatients((current) =>
      current.map((item) =>
        item.id === patient.id ? { ...item, status: 'Ativo' } : item,
      ),
    );
    setSelectedPatient({ ...patient });
    setNotice(`Retorno de ${patient.nome} marcado para acompanhamento.`);
    window.setTimeout(() => setNotice(''), 3500);
  }

  return (
    <div className="min-h-screen">
      {mobileNavOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="main">
        <div className="content">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
                GESTÃO DE CUIDADO
              </div>
              <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
                Seus pacientes
              </h1>
              <p className="mt-1 max-w-[620px] text-[12px] leading-5 text-[#7d8b83]">
                Encontre rapidamente um paciente, revise seu acompanhamento e
                identifique quem precisa de atenção.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setShowFilters((current) => !current)}
            >
              <SlidersHorizontal size={15} />
              {showFilters ? 'Ocultar filtros' : 'Filtros avançados'}
              <ChevronDown
                size={13}
                className={showFilters ? 'rotate-180' : ''}
              />
            </button>
          </div>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                <Users size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Pacientes ativos
                </div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {activeCount}
                </div>
              </div>
              <div className="ml-auto text-[10px] text-[#7d8b83]">
                de {patients.length}
              </div>
            </div>
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
                <Clock3 size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Retornos pendentes
                </div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {pendingCount}
                </div>
              </div>
              <button
                onClick={() => {
                  setStatusFilter('Retorno pendente');
                  setShowFilters(true);
                }}
                className="ml-auto text-[11px] font-semibold text-[#287653]"
              >
                Revisar
              </button>
            </div>
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2fa] text-[#5576a3]">
                <ClipboardList size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Atendimento particular
                </div>
                <div className="mt-1 text-[24px] font-bold tracking-[-.8px]">
                  {privateCount}
                </div>
              </div>
              <div className="ml-auto text-[10px] text-[#7d8b83]">
                pacientes
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-[#edf1ed] p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="section-title">Lista de pacientes</h2>
                  <p className="section-subtitle">
                    {filteredPatients.length}{' '}
                    {filteredPatients.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2.5 text-[#98a39b] sm:w-[270px]">
                    <Search size={15} />
                    <input
                      aria-label="Buscar paciente por nome"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar por nome..."
                      className="w-full bg-transparent text-[12px] text-[#304638] outline-none placeholder:text-[#9ba69e]"
                    />
                    <kbd className="hidden rounded border text-nowrap border-[#e3e9e4] bg-white px-1.5 py-0.5 text-[9px] text-[#9ba69e] md:inline">
                      ⌘ K
                    </kbd>
                  </label>
                  <button
                    className="btn-secondary"
                    onClick={() => setSortAZ((current) => !current)}
                  >
                    <ArrowDownUp size={14} />
                    Nome {sortAZ ? 'A–Z' : 'Z–A'}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#78877e]">
                  <SlidersHorizontal size={13} />
                  Filtrar:
                </span>
                <select
                  aria-label="Filtrar por tipo de atendimento"
                  value={careFilter}
                  onChange={(event) => setCareFilter(event.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none focus:border-[#8ab69a]"
                >
                  <option value="Todos">Todos os atendimentos</option>
                  <option value="Particular">Particular</option>
                  <option value="Hospitalar">Hospitalar</option>
                </select>
                <select
                  aria-label="Filtrar por condição clínica"
                  value={clinicalFilter}
                  onChange={(event) => setClinicalFilter(event.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none focus:border-[#8ab69a]"
                >
                  <option>Todas as condições</option>
                  {clinicalOptions.map((condition) => (
                    <option key={condition}>{condition}</option>
                  ))}
                </select>
                <select
                  aria-label="Filtrar por status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none focus:border-[#8ab69a]"
                >
                  <option>Todos os status</option>
                  <option>Ativo</option>
                  <option>Retorno pendente</option>
                  <option>Inativo</option>
                </select>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 px-2 py-2 text-[11px] font-semibold text-[#287653] hover:text-[#1c5c3d]"
                  >
                    <RotateCcw size={12} />
                    Limpar filtros
                  </button>
                )}
              </div>
              {showFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#f6f9f6] p-3 text-[11px] text-[#718278]">
                  <CircleAlert size={14} className="text-[#8b9b8f]" />
                  <span>
                    Use os filtros para localizar pacientes por modalidade de
                    atendimento, classificação registrada ou necessidade de
                    acompanhamento.
                  </span>
                  <button
                    className="ml-auto font-semibold text-[#287653]"
                    onClick={resetFilters}
                  >
                    Redefinir
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#fafcf9] text-[10px] font-semibold uppercase tracking-[.65px] text-[#87948b]">
                    <th className="px-5 py-3">Paciente</th>
                    <th className="px-4 py-3">Atendimento</th>
                    <th className="px-4 py-3">Classificação registrada</th>
                    <th className="px-4 py-3">Última consulta</th>
                    <th className="px-4 py-3">Próximo retorno</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f0]">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="group transition-colors hover:bg-[#fbfdfb]"
                    >
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="flex items-center gap-3 text-left"
                        >
                          <span className={`avatar alt2`}>
                            {getInitials(patient.nome)}
                          </span>
                          <span className="min-w-0">
                            <span className="block whitespace-nowrap text-[12px] font-semibold text-[#304638] group-hover:text-[#287653]">
                              {patient.nome}
                            </span>
                            <span className="mt-1 block max-w-[190px] truncate text-[10px] text-[#8a978f]">
                              {patient.contato || 'Contato não informado'}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`pill ${patient.care === 'Particular' ? 'bg-[#e9f5ed] text-[#287653]' : 'bg-[#edf2fa] text-[#5576a3]'}`}
                        >
                          {patient.care || 'Tipo de atendimento não informado'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] text-[#53665a]">
                          {patient.clinical || 'Condição não informada'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="whitespace-nowrap text-[11px] text-[#718278]">
                          {patient.lastVisit ? patient.lastVisit : 'Sem consulta'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {patient.nextVisit ? (
                          <span className="whitespace-nowrap text-[11px] text-[#53665a]">
                            {patient.nextVisit}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#a8752c]">
                            Não agendado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`pill ${patient.status === 'Ativo' ? 'bg-[#e9f5ed] text-[#287653]' : patient.status === 'Retorno pendente' ? 'bg-[#fff5e6] text-[#a8752c]' : 'bg-[#f0f2f0] text-[#7d8b83]'}`}
                        >
                          {patient.status === 'Ativo' ? (
                            <CheckCircle2 size={11} />
                          ) : patient.status === 'Retorno pendente' ? (
                            <Clock3 size={11} />
                          ) : (
                            <CircleAlert size={11} />
                          )}
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          aria-label={`Ver detalhes de ${patient.name}`}
                          onClick={() => setSelectedPatient(patient)}
                          className="rounded-lg border border-transparent p-2 text-[#819087] hover:border-[#e5ebe6] hover:bg-white hover:text-[#287653]"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5ef] text-[#4c8965]">
                    <Search size={20} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#304638]">
                    Nenhum paciente encontrado
                  </h3>
                  <p className="mt-1 max-w-sm text-[12px] leading-5 text-[#87948b]">
                    Tente outro nome ou ajuste os filtros para ampliar os
                    resultados.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-[12px] font-semibold text-[#287653]"
                  >
                    Limpar busca e filtros
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-[#edf1ed] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-[#87948b]">
                Exibindo{' '}
                <span className="font-semibold text-[#53665a]">
                  {filteredPatients.length}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-[#53665a]">
                  {patients.length}
                </span>{' '}
                pacientes
              </p>
              <p className="text-[10px] text-[#9aa59d]">
                Os dados clínicos são demonstrativos e não representam
                diagnóstico.
              </p>
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

      {selectedPatient && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPatient(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-details-title"
            className="my-auto w-full max-w-[460px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f5ed] text-[13px] font-bold text-[#287653] alt2`}
                >
                  {getInitials(selectedPatient.nome)}
                </div>
                <div>
                  <h2
                    id="patient-details-title"
                    className="text-[17px] font-bold text-[#20352c]"
                  >
                    {selectedPatient.nome}
                  </h2>
                  <p className="mt-1 text-[11px] text-[#87948b]">
                    Paciente
                  </p>
                </div>
              </div>
              <button
                aria-label="Fechar detalhes"
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-2 text-[#87948b] hover:bg-[#f5f8f5]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7f9f7] p-3">
                <div className="text-[10px] text-[#87948b]">Atendimento</div>
                <div className="mt-1 text-[12px] font-semibold text-[#304638]">
                  {/* {selectedPatient.care} */} não informado
                </div>
              </div>
              <div className="rounded-xl bg-[#f7f9f7] p-3">
                <div className="text-[10px] text-[#87948b]">Status</div>
                <div className="mt-1 text-[12px] font-semibold text-[#304638]">
                  {/* {selectedPatient.status} */} não informado
                </div>
              </div>
              <div className="col-span-2 rounded-xl border border-[#edf1ed] p-3">
                <div className="text-[10px] text-[#87948b]">
                  Classificação registrada
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#304638]">
                  {/* {selectedPatient.clinical} */} não informado
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-[#87948b]">
                      Última consulta
                    </div>
                    <div className="mt-1 text-[11px] text-[#53665a]">
                      {/* {selectedPatient.lastVisit} */} não informado
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#87948b]">
                      Próximo retorno
                    </div>
                    <div className="mt-1 text-[11px] text-[#53665a]">
                      {/* {selectedPatient.nextVisit} */} não agendado
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-2 rounded-xl border border-[#edf1ed] p-3">
                <div className="flex items-center gap-2 text-[11px] text-[#53665a]">
                  <Mail size={13} className="text-[#87948b]" />
                  {selectedPatient.contato}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#53665a]">
                  <Phone size={13} className="text-[#87948b]" />
                  {selectedPatient.contato}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#edf1ed] pt-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedPatient(null)}
              >
                Fechar
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  setAppointmentPatient(selectedPatient);
                  openModal(
                    <FormsNewAppointment
                      onClose={() => {
                        closeModal();
                        setAppointmentPatient(null);
                      }} />
                    )
                }}
              >
                <CalendarDays size={14} />
                Agendar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  router.push("/app/paciente")
                }}
              >
                <FileText size={14} />
                Abrir Ficha
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
