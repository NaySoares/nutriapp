import Link from "next/link";
import MarketingHeader from "../../components/marketing/MarketingHeader";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import PatientAppPreview from "../../components/marketing/PatientAppPreview";

const appStoreUrl = "https://example.com/nutriapp-app-store";
const googlePlayUrl = "https://example.com/nutriapp-google-play";

function StoreIcon({ kind }: { kind: "apple" | "play" }) {
  if (kind === "apple") return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M16.7 12.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.6 0-3.1.9-3.9 2.3-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.7-.7 3.2-.7 1.5 0 1.9.7 3.2.7 1.3 0 2.1-1.1 2.9-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.9-1.1-2.9-4ZM14.4 6c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2.1-.5 2.7-1.3Z" /></svg>;
  return <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M5.2 3.4c-.5.3-.8.8-.8 1.6v14c0 .8.3 1.3.8 1.6l8-8.6-8-8.6Z" fill="#34D399"/><path d="m15 14.3-9.8 6.3 10.5-8.1-1-1-1 2.8Z" fill="#60A5FA"/><path d="m5.2 3.4 9.8 6.3 2.8 1.8-2.8 1.8-9.8 6.3 8-8.6-8-8.6Z" fill="#A7F3D0"/><path d="m15 9.7 4.4 2.7c.9.5.9 1.4 0 1.9L15 17l-2-5 2-2.3Z" fill="#FBBF24"/></svg>;
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#fbfcf8] text-slate-900">
      <MarketingHeader />
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-28 top-0 h-[35rem] w-[35rem] rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-lime-100/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-600" />NutriApp para pacientes</p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">Seu plano alimentar, mais perto da sua rotina.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Consulte as orientações do seu nutricionista e mantenha seu acompanhamento à mão. A plataforma de gestão do profissional continua no site; este app é para pacientes.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={appStoreUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-3 text-left text-white transition hover:bg-slate-800">
                <StoreIcon kind="apple" /><span><span className="block text-[10px] text-slate-300">Baixe na</span><span className="block text-sm font-semibold">App Store</span></span>
              </a>
              <a href={googlePlayUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-3 text-left text-white transition hover:bg-slate-800">
                <StoreIcon kind="play" /><span><span className="block text-[10px] text-slate-300">Disponível no</span><span className="block text-sm font-semibold">Google Play</span></span>
              </a>
            </div>
            <p className="mt-4 max-w-xl text-xs leading-5 text-amber-800">Atenção: os links das lojas são fictícios, apenas para demonstração. Substitua-os pelos endereços oficiais antes de publicar.</p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2"><svg className="h-4 w-4 text-emerald-700" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>Orientações do nutricionista</span>
              <span className="inline-flex items-center gap-2"><svg className="h-4 w-4 text-emerald-700" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>Acompanhamento no dia a dia</span>
            </div>
          </div>
          <PatientAppPreview />
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Como funciona</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Três passos para acompanhar seu plano.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { n: "01", title: "Receba o acesso", copy: "Seu nutricionista orienta como acessar o acompanhamento pelo aplicativo." },
              { n: "02", title: "Instale o app", copy: "Use o botão correspondente ao sistema do seu celular quando os links oficiais estiverem disponíveis." },
              { n: "03", title: "Consulte suas orientações", copy: "Tenha seu plano alimentar como referência para a rotina entre consultas." },
            ].map((item) => (
              <article key={item.n} className="rounded-3xl border border-slate-200 bg-[#fbfcf8] p-6 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-sm font-bold text-white">{item.n}</span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-7 sm:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Você é nutricionista?</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">A gestão do seu consultório é pela web.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Conheça a plataforma profissional para organizar pacientes, agenda, planos alimentares e financeiro.</p>
            </div>
            <Link href="/precos" className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900">Ver planos para nutricionistas</Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
