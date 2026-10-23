import Link from "next/link";
import MarketingHeader from "../components/marketing/MarketingHeader";
import MarketingFooter from "../components/marketing/MarketingFooter";
import ProductPreview from "../components/marketing/ProductPreview";

const features = [
  {
    number: "01",
    title: "Pacientes e histórico",
    description: "Encontre dados importantes, avaliações e evolução clínica sem procurar em várias planilhas.",
    icon: "people",
  },
  {
    number: "02",
    title: "Agenda que faz sentido",
    description: "Visualize seus atendimentos e organize a rotina do consultório em um só lugar.",
    icon: "calendar",
  },
  {
    number: "03",
    title: "Planos alimentares",
    description: "Monte planos personalizados e reaproveite modelos para agilizar o trabalho clínico.",
    icon: "plate",
  },
  {
    number: "04",
    title: "Financeiro mais claro",
    description: "Acompanhe recebimentos e tenha uma visão melhor da movimentação do consultório.",
    icon: "chart",
  },
  {
    number: "05",
    title: "Avaliações e medidas",
    description: "Registre medidas e acompanhe mudanças ao longo do acompanhamento nutricional.",
    icon: "activity",
  },
  {
    number: "06",
    title: "Paciente mais próximo",
    description: "O aplicativo do paciente aproxima o plano alimentar da rotina entre as consultas.",
    icon: "mobile",
  },
];

function FeatureIcon({ name }: { name: string }) {
  const common = "h-6 w-6";
  if (name === "people") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3A4.5 4.5 0 0 1 15 18.5V20M16 5.2a3.2 3.2 0 0 1 0 6.2M18 14.5a4.5 4.5 0 0 1 3 4.2V20" strokeLinecap="round" /></svg>;
  if (name === "calendar") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6" strokeLinecap="round" /></svg>;
  if (name === "plate") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="13" r="8" /><circle cx="12" cy="13" r="4.5" /><path d="M4 3v5M2 5.5h4M20 3v7M18 7h4" strokeLinecap="round" /></svg>;
  if (name === "chart") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 20h18M5 16l4-4 3 2 6-7" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 7h4v4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "activity") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 12h4l3-7 4 14 3-7h4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10 5h4M10 18.5h4" strokeLinecap="round" /></svg>;
}

function Check() {
  return <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfcf8] text-slate-900">
      <MarketingHeader />

      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-24 h-[32rem] w-[32rem] rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute -left-40 top-72 h-80 w-80 rounded-full bg-lime-100/60 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-900/10 to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[.92fr_1.08fr] lg:gap-12 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Gestão para nutricionistas, do seu jeito
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.7rem]">
              Seu consultório em ordem. <span className="text-emerald-800">Seu cuidado em primeiro lugar.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Organize pacientes, agenda, planos alimentares e financeiro em uma plataforma web feita para simplificar a rotina do nutricionista.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/cadastro" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20">
                Quero organizar meu consultório
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link href="/precos" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-white">
                Conhecer os planos
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2"><Check /> Agenda e pacientes</span>
              <span className="inline-flex items-center gap-2"><Check /> Planos alimentares</span>
              <span className="inline-flex items-center gap-2"><Check /> Visão financeira</span>
            </div>
            <p className="mt-5 text-[11px] leading-5 text-slate-400">Prévia de produto e informações comerciais demonstrativas. Os dados são fictícios.</p>
          </div>
          <div id="produto" className="scroll-mt-24">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/75">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            { title: "Menos tarefas espalhadas", copy: "Centralize informações importantes da rotina." },
            { title: "Mais clareza para decidir", copy: "Enxergue agenda, atendimentos e recebimentos." },
            { title: "Continuidade no cuidado", copy: "Mantenha o plano alimentar próximo do paciente." },
          ].map((item, index) => (
            <div key={item.title} className={`flex gap-4 ${index ? "sm:border-l sm:border-slate-200 sm:pl-6" : ""}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-1.5 text-sm leading-6 text-slate-600">{item.copy}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="recursos" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Uma rotina conectada</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">O essencial do consultório, em um só lugar.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Ferramentas que acompanham o trabalho clínico e administrativo sem transformar a rotina em mais uma tarefa.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} className="group rounded-3xl border border-slate-200/80 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-700 group-hover:text-white"><FeatureIcon name={feature.icon} /></span>
                  <span className="text-xs font-semibold tracking-wider text-slate-300">{feature.number}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef4eb] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Um fluxo mais simples</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Do agendamento ao acompanhamento, com menos atrito.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">O NutriApp conecta as etapas que fazem parte do trabalho do nutricionista para você gastar menos energia organizando informações e mais energia usando-as no atendimento.</p>
            <Link href="/precos" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950">
              Compare os planos
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "01", title: "Organize", copy: "Cadastre pacientes e mantenha a agenda em dia." },
              { step: "02", title: "Planeje", copy: "Registre avaliações e monte planos alimentares." },
              { step: "03", title: "Acompanhe", copy: "Consulte a evolução e mantenha o paciente por perto." },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <span className="text-xs font-bold tracking-wider text-emerald-700">{item.step}</span>
                <h3 className="mt-8 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-emerald-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
            <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[50px] border-white/5" />
            <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Para quem você acompanha</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">O cuidado continua entre uma consulta e outra.</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/80 sm:text-base">O aplicativo NutriApp é pensado para pacientes consultarem as orientações do nutricionista no dia a dia. A gestão profissional continua no site.</p>
              </div>
              <Link href="/baixar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50">
                Conhecer o app do paciente
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Dúvidas comuns</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Antes de começar</h2>
          </div>
          <div className="mt-9 space-y-3">
            {[
              { q: "O NutriApp é um aplicativo para nutricionistas?", a: "A gestão do consultório é feita pelo site, no computador ou navegador. O aplicativo móvel é destinado aos pacientes acompanhados pelo nutricionista." },
              { q: "Posso organizar a agenda e o financeiro?", a: "A proposta do NutriApp é reunir pacientes, agenda, planos alimentares e visão financeira na mesma plataforma. Os recursos e limites comerciais desta demonstração são ilustrativos." },
              { q: "Os preços exibidos já são oficiais?", a: "Não. Os valores e os limites dos planos nesta demonstração são fictícios e deverão ser substituídos antes da publicação comercial." },
            ].map((item) => (
              <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:border-emerald-200 open:bg-emerald-50/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                  {item.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-45 group-open:bg-emerald-100 group-open:text-emerald-800">+</span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
