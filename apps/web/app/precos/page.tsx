"use client";

import Link from "next/link";
import { useState } from "react";
import MarketingHeader from "../../components/marketing/MarketingHeader";
import MarketingFooter from "../../components/marketing/MarketingFooter";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthly: number;
  annual: number;
  patients: string;
  features: string[];
  highlight?: boolean;
  label: string;
};

const plans: Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    description: "Para organizar os primeiros passos da rotina.",
    monthly: 49,
    annual: 39,
    patients: "Até 50 pacientes ativos",
    label: "Para começar",
    features: ["Cadastro e histórico de pacientes", "Agenda de consultas", "Biblioteca de alimentos", "Planos alimentares", "Acesso ao app do paciente", "Suporte por e-mail"],
  },
  {
    id: "profissional",
    name: "Profissional",
    description: "Para consultórios em crescimento que precisam de mais visão.",
    monthly: 89,
    annual: 71,
    patients: "Até 200 pacientes ativos",
    label: "Mais completo",
    highlight: true,
    features: ["Tudo do Essencial", "Avaliações e histórico de medidas", "Gestão financeira", "Modelos reutilizáveis de planos", "Relatórios de acompanhamento", "Atendimento prioritário"],
  },
  {
    id: "clinica",
    name: "Clínica",
    description: "Para rotinas maiores e equipes que precisam colaborar.",
    monthly: 149,
    annual: 119,
    patients: "Pacientes ilimitados",
    label: "Para expandir",
    features: ["Tudo do Profissional", "Até 5 acessos de equipe", "Visão consolidada do consultório", "Relatórios ampliados", "Apoio prioritário", "Configuração assistida"],
  },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function Check() {
  return <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <main className="min-h-screen bg-[#fbfcf8] text-slate-900">
      <MarketingHeader />
      <section className="relative overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-600" />Planos para cada fase do consultório</p>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Escolha o apoio certo para sua rotina.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Comece com o essencial e avance conforme seu consultório cresce. Compare os recursos com clareza, sem surpresas escondidas.</p>
            <div className="mt-7 inline-flex items-center rounded-full border border-slate-200 bg-white p-1.5 shadow-sm" role="group" aria-label="Periodicidade de cobrança">
              <button type="button" onClick={() => setAnnual(false)} aria-pressed={!annual} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${!annual ? "bg-emerald-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>Mensal</button>
              <button type="button" onClick={() => setAnnual(true)} aria-pressed={annual} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${annual ? "bg-emerald-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                Anual <span className={`rounded-full px-2 py-0.5 text-[10px] ${annual ? "bg-white/15 text-emerald-50" : "bg-emerald-50 text-emerald-800"}`}>-20%</span>
              </button>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              return (
                <article key={plan.id} className={`relative flex flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-7 ${plan.highlight ? "border-emerald-700 ring-2 ring-emerald-700/10 lg:-my-3 lg:p-8" : "border-slate-200"}`}>
                  {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-800 px-4 py-1.5 text-[11px] font-bold text-white shadow-md">Recomendado para crescer</div>}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-950">{plan.name}</p>
                      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
                    </div>
                    {!plan.highlight && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{plan.label}</span>}
                  </div>
                  <div className="mt-6 border-b border-slate-100 pb-6">
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-semibold tracking-tight text-slate-950">{formatPrice(price)}</span>
                      <span className="pb-1 text-sm text-slate-500">/mês</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{annual ? `${formatPrice(price * 12)} cobrados por ano` : "Cobrança mensal demonstrativa"}</p>
                    <p className="mt-4 rounded-xl bg-[#f5f8f2] px-3.5 py-2.5 text-xs font-semibold text-slate-700">{plan.patients}</p>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3.5">
                    {plan.features.map((feature) => <li key={feature} className="flex gap-2.5 text-sm leading-5 text-slate-700"><Check />{feature}</li>)}
                  </ul>
                  <Link href={`/cadastro?plano=${plan.id}`} className={`mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-emerald-700/20 ${plan.highlight ? "bg-emerald-800 text-white hover:bg-emerald-900" : "border border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"}`}>
                    Tenho interesse neste plano
                  </Link>
                </article>
              );
            })}
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-slate-500">Atenção: preços, limites e recursos por plano são fictícios, usados apenas para demonstrar a página. A cobrança e a contratação ainda devem ser configuradas com os valores oficiais.</p>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Sem letra miúda</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Um plano que acompanha sua fase.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">A estrutura de preços foi montada como exemplo. Antes do lançamento, ajuste valores, limites, recursos e regras de contratação ao modelo comercial definitivo.</p>
            </div>
            <div className="space-y-3">
              {[
                { q: "Posso mudar de plano depois?", a: "A experiência de troca de plano deve ser configurada quando as regras comerciais forem definidas. Nesta demonstração, os botões levam ao cadastro." },
                { q: "O aplicativo está incluído nos planos?", a: "A proposta é que o nutricionista utilize a plataforma web e que o aplicativo móvel seja destinado aos pacientes. Os limites por plano são ilustrativos." },
                { q: "Os valores já são os preços finais?", a: "Não. Todos os preços nesta página são fictícios e precisam ser substituídos pelos valores oficiais antes da publicação." },
              ].map((item) => (
                <details key={item.q} className="group rounded-2xl border border-slate-200 px-5 py-4 open:border-emerald-200 open:bg-emerald-50/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                    {item.q}<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-emerald-900 p-7 text-white sm:p-10 md:flex-row md:items-center">
          <div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pronto para organizar sua rotina?</h2><p className="mt-2 text-sm leading-6 text-emerald-50/80">Conheça a plataforma e descubra como ela pode se encaixar no seu consultório.</p></div>
          <Link href="/cadastro" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-50">Conhecer a plataforma</Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
