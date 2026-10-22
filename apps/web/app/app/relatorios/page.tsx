"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Apple, ArrowDownRight, ArrowDownUp, ArrowRight, ArrowUpRight, Bell,
  CalendarDays, CheckCircle2, ChevronDown, ClipboardList, Download, FileSpreadsheet,
  FileText, Filter, HeartPulse, LayoutDashboard, MoreHorizontal, Search,
  Settings, SlidersHorizontal, TrendingUp, Users, Wallet, X, CircleAlert,
} from "lucide-react";
import { SideBar } from "../../../components/layout/sidebar";

type ReportTab = "Visão geral" | "Atendimentos" | "Pacientes" | "Financeiro";
type Period = "Últimos 30 dias" | "Últimos 90 dias" | "Este ano";

const reportData: Record<Period, { revenue: number; previousRevenue: number; appointments: number; previousAppointments: number; newPatients: number; attendance: number; months: { label: string; revenue: number; appointments: number }[] }> = {
  "Últimos 30 dias": {
    revenue: 12480, previousRevenue: 10950, appointments: 86, previousAppointments: 78, newPatients: 12, attendance: 92,
    months: [{ label: "Sem 1", revenue: 2350, appointments: 18 }, { label: "Sem 2", revenue: 2980, appointments: 21 }, { label: "Sem 3", revenue: 3150, appointments: 23 }, { label: "Sem 4", revenue: 4000, appointments: 24 }],
  },
  "Últimos 90 dias": {
    revenue: 35120, previousRevenue: 32400, appointments: 248, previousAppointments: 231, newPatients: 34, attendance: 91,
    months: [{ label: "Ago", revenue: 10300, appointments: 73 }, { label: "Set", revenue: 12340, appointments: 89 }, { label: "Out", revenue: 12480, appointments: 86 }],
  },
  "Este ano": {
    revenue: 132850, previousRevenue: 119200, appointments: 940, previousAppointments: 876, newPatients: 128, attendance: 93,
    months: [{ label: "Mai", revenue: 9800, appointments: 70 }, { label: "Jun", revenue: 10450, appointments: 74 }, { label: "Jul", revenue: 11100, appointments: 78 }, { label: "Ago", revenue: 10300, appointments: 73 }, { label: "Set", revenue: 12340, appointments: 89 }, { label: "Out", revenue: 12480, appointments: 86 }],
  },
};

const conditions = [
  { label: "Eutrofia", count: 42, color: "#4f966d" },
  { label: "Sobrepeso", count: 28, color: "#9bc7a6" },
  { label: "Obesidade", count: 19, color: "#d5a35b" },
  { label: "Baixo peso", count: 8, color: "#8fa9c6" },
  { label: "Outros acompanhamentos", count: 11, color: "#c7d1c9" },
];

const appointmentRows = [
  { label: "Consultas realizadas", value: 86, detail: "Atendimentos concluídos no período", change: "+10,3%", positive: true },
  { label: "Faltas", value: 7, detail: "Pacientes que não compareceram", change: "8,1%", positive: false },
  { label: "Cancelamentos", value: 5, detail: "Consultas canceladas previamente", change: "5,8%", positive: true },
  { label: "Novos pacientes", value: 12, detail: "Primeiro atendimento no período", change: "+4", positive: true },
];

const financeRows = [
  { name: "Consultas particulares", amount: 9240, percent: 74, color: "#4f966d" },
  { name: "Planos de acompanhamento", amount: 2640, percent: 21, color: "#9bc7a6" },
  { name: "Outros serviços", amount: 600, percent: 5, color: "#d5a35b" },
];

const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("Últimos 30 dias");
  const [tab, setTab] = useState<ReportTab>("Visão geral");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const data = reportData[period];
  const revenueChange = ((data.revenue - data.previousRevenue) / data.previousRevenue) * 100;
  const maxRevenue = Math.max(...data.months.map((item) => item.revenue));
  const maxAppointments = Math.max(...data.months.map((item) => item.appointments));

  const visibleRows = useMemo(() => appointmentRows.filter((row) => row.label.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))), [query]);

  function exportReport(format: "PDF" | "CSV") {
    if (format === "CSV") {
      const rows = [
        ["Relatório", "Período", "Valor"],
        ["Receita recebida", period, String(data.revenue)],
        ["Consultas realizadas", period, String(data.appointments)],
        ["Novos pacientes", period, String(data.newPatients)],
        ["Taxa de comparecimento (%)", period, String(data.attendance)],
        ...conditions.map((condition) => ["Distribuição clínica - " + condition.label, period, String(condition.count)]),
      ];
      const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `relatorio-nutri-${period.toLowerCase().replaceAll(" ", "-")}.csv`; anchor.click(); URL.revokeObjectURL(url);
      setNotice("Relatório CSV exportado com os dados demonstrativos.");
    } else {
      setNotice("Para exportar em PDF, conecte esta tela a uma solução de geração de documentos.");
    }
    window.setTimeout(() => setNotice(""), 4000);
  }

  return (
    <div className="min-h-screen">
      {mobileNavOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-10 bg-black/20 md:hidden" onClick={() => setMobileNavOpen(false)} />}
      <SideBar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

      <main className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu rounded-lg border border-[#e8eee9] p-2 text-[#496354] md:hidden"
              aria-label="Abrir menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <FileText size={18} />
            </button>
            <div>
              <div className="text-[11px] text-[#849188]">
                Segunda-feira, 19 de outubro de 2026
              </div>
              <div className="mt-1 text-[17px] font-bold tracking-[-.45px]">
                Relatórios
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button aria-label="Notificações" onClick={() => setNotice("Você está vendo dados demonstrativos do relatório.")} className="relative rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"><Bell size={16} /></button><div className="relative"><button className="btn-secondary" onClick={() => setShowPeriodMenu((current) => !current)}><CalendarDays size={14} /><span className="hidden sm:inline">{period}</span><span className="sm:hidden">Período</span><ChevronDown size={13} /></button>{showPeriodMenu && <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-[#e5ebe6] bg-white p-1.5 shadow-lg">{(["Últimos 30 dias", "Últimos 90 dias", "Este ano"] as Period[]).map((item) => <button key={item} onClick={() => { setPeriod(item); setShowPeriodMenu(false); }} className={`block w-full rounded-lg px-3 py-2.5 text-left text-[11px] ${period === item ? "bg-[#edf5ef] font-semibold text-[#287653]" : "text-[#53665a] hover:bg-[#f7f9f7]"}`}>{item}</button>)}</div>}</div><button className="btn-primary" onClick={() => exportReport("CSV")}><Download size={14} /><span className="hidden sm:inline">Exportar CSV</span><span className="sm:hidden">Exportar</span></button></div></header>

        <div className="content">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">VISÃO DO CONSULTÓRIO</div><h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">Decisões com contexto</h1><p className="mt-1 max-w-[620px] text-[12px] leading-5 text-[#7d8b83]">Acompanhe os indicadores que ajudam a entender a saúde do consultório e identificar onde agir.</p></div><div className="flex items-center gap-1.5 rounded-lg border border-[#e5ebe6] bg-white p-1">{(["Visão geral", "Atendimentos", "Pacientes", "Financeiro"] as ReportTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-md px-3 py-2 text-[10px] font-semibold transition ${tab === item ? "bg-[#eaf4ed] text-[#287653]" : "text-[#7d8b83] hover:bg-[#f7f9f7]"}`}>{item}</button>)}</div></div>

          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#e5eee7] bg-[#f5f9f5] px-4 py-3"><div className="mt-0.5 text-[#4f966d]"><CheckCircle2 size={15} /></div><p className="text-[11px] leading-5 text-[#627568]"><span className="font-semibold text-[#355743]">Leitura rápida:</span> no período selecionado, a receita é de <strong>{currency(data.revenue)}</strong> e foram realizadas <strong>{data.appointments} consultas</strong>. Use os detalhes abaixo para investigar mudanças e planejar os próximos passos.</p></div>

          {(tab === "Visão geral" || tab === "Financeiro") && <>
            <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-[11px] text-[#7d8b83]">Receita recebida</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f5ed] text-[#287653]"><Wallet size={16} /></span></div><div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">{currency(data.revenue)}</div><div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#287653]"><ArrowUpRight size={13} />{revenueChange.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% <span className="font-normal text-[#87948b]">vs. período anterior</span></div></div>
              <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-[11px] text-[#7d8b83]">Consultas realizadas</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf2fa] text-[#5576a3]"><CalendarDays size={16} /></span></div><div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">{data.appointments}</div><div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#287653]"><ArrowUpRight size={13} />{Math.round(((data.appointments - data.previousAppointments) / data.previousAppointments) * 100)}% <span className="font-normal text-[#87948b]">vs. período anterior</span></div></div>
              <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-[11px] text-[#7d8b83]">Novos pacientes</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f2edf9] text-[#8664a7]"><Users size={16} /></span></div><div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">{data.newPatients}</div><div className="mt-2 text-[10px] text-[#87948b]">Primeiro atendimento no período</div></div>
              <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-[11px] text-[#7d8b83]">Taxa de comparecimento</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff5e6] text-[#a8752c]"><CheckCircle2 size={16} /></span></div><div className="mt-3 text-[25px] font-bold tracking-[-1px] text-[#20352c]">{data.attendance}%</div><div className="mt-2 text-[10px] text-[#87948b]">Consultas realizadas ÷ agendadas</div></div>
            </section>
            <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
              <div className="panel p-4 sm:p-5"><div className="mb-5 flex items-start justify-between"><div><h2 className="section-title">Evolução da receita</h2><p className="section-subtitle">Valores recebidos ao longo do período</p></div><span className="rounded-lg bg-[#f5f8f5] p-2 text-[#718278]"><TrendingUp size={16} /></span></div><div className="mb-4 flex items-baseline gap-2"><span className="text-[22px] font-bold tracking-[-.8px] text-[#20352c]">{currency(data.revenue)}</span><span className="text-[10px] text-[#87948b]">no total</span></div><div className="flex h-[178px] items-end gap-3 border-b border-[#e9eee9] px-1 sm:gap-5">{data.months.map((item) => <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-[145px] w-full items-end justify-center"><div title={`${item.label}: ${currency(item.revenue)}`} className="w-full max-w-[46px] rounded-t-md bg-[#76ae87] transition hover:bg-[#4f966d]" style={{ height: `${Math.max(8, (item.revenue / maxRevenue) * 100)}%` }} /></div><span className="pb-2 text-[10px] text-[#87948b]">{item.label}</span></div>)}</div><div className="mt-4 flex items-center gap-2 text-[10px] text-[#87948b]"><span className="h-2 w-2 rounded-sm bg-[#76ae87]" />Receita recebida <span className="ml-auto">Comparação ilustrativa</span></div></div>
              <div className="panel p-4 sm:p-5"><div className="mb-5"><h2 className="section-title">Origem da receita</h2><p className="section-subtitle">Distribuição por tipo de serviço</p></div><div className="space-y-5">{financeRows.map((row) => <div key={row.name}><div className="mb-2 flex items-center justify-between gap-3"><span className="text-[11px] text-[#53665a]">{row.name}</span><span className="whitespace-nowrap text-[11px] font-semibold text-[#304638]">{currency(row.amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1ed]"><div className="h-full rounded-full" style={{ width: `${row.percent}%`, backgroundColor: row.color }} /></div><div className="mt-1 text-right text-[9px] text-[#98a39b]">{row.percent}%</div></div>)}</div><div className="mt-5 rounded-lg bg-[#f6f9f6] p-3 text-[10px] leading-4 text-[#7d8b83]">Atendimentos hospitalares sem cobrança individual não entram nesta composição. Ajuste as categorias conforme o modelo de faturamento.</div></div>
            </section>
          </>}

          {(tab === "Visão geral" || tab === "Atendimentos") && <section className="mb-5 panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] p-4 sm:p-5"><div><h2 className="section-title">Resumo de atendimentos</h2><p className="section-subtitle">Volume, faltas e novos pacientes no período</p></div><label className="flex items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2 text-[#98a39b]"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar indicador" aria-label="Buscar indicador" className="w-[130px] bg-transparent text-[11px] text-[#304638] outline-none placeholder:text-[#9ba69e]" /></label></div><div className="divide-y divide-[#f0f3f0]">{visibleRows.map((row) => <div key={row.label} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f3f7f3] text-[#65816d]"><ClipboardList size={16} /></div><div className="min-w-[150px] flex-1"><div className="text-[12px] font-semibold text-[#304638]">{row.label}</div><div className="mt-1 text-[10px] text-[#87948b]">{row.detail}</div></div><div className="min-w-[48px] text-right text-[18px] font-bold text-[#304638]">{row.value}</div><div className={`flex min-w-[75px] items-center justify-end gap-1 text-[10px] font-semibold ${row.positive ? "text-[#287653]" : "text-[#a8752c]"}`}>{row.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{row.change}</div></div>)}</div>{visibleRows.length === 0 && <div className="p-8 text-center text-[12px] text-[#87948b]">Nenhum indicador corresponde à busca.</div>}<div className="flex items-center justify-between border-t border-[#edf1ed] bg-[#fafcf9] px-4 py-3 sm:px-5"><span className="text-[10px] text-[#87948b]">Indicadores de demonstração</span><button onClick={() => setShowDetails((current) => !current)} className="flex items-center gap-1 text-[10px] font-semibold text-[#287653]">{showDetails ? "Ocultar metodologia" : "Como interpretar"}<ChevronDown size={12} className={showDetails ? "rotate-180" : ""} /></button></div>{showDetails && <div className="border-t border-[#edf1ed] bg-[#fafcf9] px-4 py-3 text-[10px] leading-5 text-[#718278] sm:px-5">Compare períodos de duração equivalente. Taxa de comparecimento deve considerar consultas realizadas sobre consultas efetivamente agendadas; defina como cancelamentos e remarcações entram no cálculo para evitar interpretações enganosas.</div>}</section>}

          {(tab === "Visão geral" || tab === "Pacientes") && <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.1fr]"><div className="panel p-4 sm:p-5"><div className="mb-4"><h2 className="section-title">Perfil clínico dos pacientes</h2><p className="section-subtitle">Classificações registradas nos prontuários</p></div><div className="flex items-center gap-5"><div className="relative h-[142px] w-[142px] shrink-0 rounded-full" style={{ background: `conic-gradient(${conditions.map((item, index) => { const before = conditions.slice(0, index).reduce((sum, current) => sum + current.count, 0); const total = conditions.reduce((sum, current) => sum + current.count, 0); const start = (before / total) * 100; const end = ((before + item.count) / total) * 100; return `${item.color} ${start}% ${end}%`; }).join(", ")})` }}><div className="absolute inset-[24px] flex flex-col items-center justify-center rounded-full bg-white"><span className="text-[24px] font-bold tracking-[-1px] text-[#20352c]">{conditions.reduce((sum, item) => sum + item.count, 0)}</span><span className="text-[9px] text-[#87948b]">registros</span></div></div><div className="min-w-0 flex-1 space-y-2.5">{conditions.map((condition) => <div key={condition.label} className="flex items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: condition.color }} /><span className="min-w-0 flex-1 text-[10px] text-[#53665a]">{condition.label}</span><span className="text-[10px] font-semibold text-[#304638]">{condition.count}</span></div>)}</div></div><p className="mt-4 rounded-lg bg-[#f6f9f6] p-3 text-[10px] leading-4 text-[#7d8b83]">Use esta visão para compreender a carteira de acompanhamento, não para inferir diagnósticos automaticamente.</p></div>
            <div className="panel p-4 sm:p-5"><div className="mb-4 flex items-start justify-between"><div><h2 className="section-title">Ações sugeridas</h2><p className="section-subtitle">Próximos passos a partir dos indicadores</p></div><span className="rounded-lg bg-[#fff5e6] p-2 text-[#a8752c]"><CircleAlert size={16} /></span></div><div className="space-y-3"><button onClick={() => setNotice("Abra a tela de agenda para revisar as faltas e combinar retornos conforme o contexto de cada paciente.")} className="flex w-full items-start gap-3 rounded-xl border border-[#edf1ed] p-3 text-left transition hover:border-[#c9dfcf] hover:bg-[#fbfdfb]"><div className="mt-0.5 text-[#a8752c]"><CalendarDays size={16} /></div><div className="min-w-0 flex-1"><div className="text-[11px] font-semibold text-[#304638]">Revisar faltas e cancelamentos</div><p className="mt-1 text-[10px] leading-4 text-[#87948b]">Houve 7 faltas no período. Verifique quais precisam de contato ou remarcação.</p></div><ArrowRight size={14} className="mt-0.5 text-[#87948b]" /></button><button onClick={() => setTab("Financeiro")} className="flex w-full items-start gap-3 rounded-xl border border-[#edf1ed] p-3 text-left transition hover:border-[#c9dfcf] hover:bg-[#fbfdfb]"><div className="mt-0.5 text-[#287653]"><Wallet size={16} /></div><div className="min-w-0 flex-1"><div className="text-[11px] font-semibold text-[#304638]">Acompanhar a evolução financeira</div><p className="mt-1 text-[10px] leading-4 text-[#87948b]">A receita variou {revenueChange.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% em relação ao período anterior.</p></div><ArrowRight size={14} className="mt-0.5 text-[#87948b]" /></button><button onClick={() => setTab("Pacientes")} className="flex w-full items-start gap-3 rounded-xl border border-[#edf1ed] p-3 text-left transition hover:border-[#c9dfcf] hover:bg-[#fbfdfb]"><div className="mt-0.5 text-[#5576a3]"><Users size={16} /></div><div className="min-w-0 flex-1"><div className="text-[11px] font-semibold text-[#304638]">Entender o perfil da carteira</div><p className="mt-1 text-[10px] leading-4 text-[#87948b]">Revise os registros clínicos e confirme se estão atualizados.</p></div><ArrowRight size={14} className="mt-0.5 text-[#87948b]" /></button></div></div>
          </section>}

          <div className="flex flex-col gap-2 border-t border-[#e9eee9] py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] text-[#9aa59d]">Dados fictícios para demonstração. Resultados não representam dados reais do consultório.</p><div className="flex items-center gap-3"><button onClick={() => exportReport("CSV")} className="flex items-center gap-1.5 text-[10px] font-semibold text-[#287653]"><FileSpreadsheet size={13} />Exportar CSV</button><button onClick={() => exportReport("PDF")} className="flex items-center gap-1.5 text-[10px] font-semibold text-[#718278]"><FileText size={13} />Exportar PDF</button></div></div>
        </div>
      </main>

      {notice && <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-2 rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-[12px] text-[#355743] shadow-lg"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#287653]" /><span>{notice}</span><button aria-label="Fechar aviso" onClick={() => setNotice("")} className="ml-2 text-[#87948b]"><X size={14} /></button></div>}
    </div>
  );
}
