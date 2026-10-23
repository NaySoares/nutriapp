"use client";

import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-[#f5f7f1]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
            Nutri<span className="text-emerald-700">App</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Mais organização para a rotina do nutricionista. Mais clareza para o acompanhamento do paciente.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Conheça</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/#recursos" className="hover:text-emerald-800">Recursos</Link>
            <Link href="/precos" className="hover:text-emerald-800">Planos e preços</Link>
            <Link href="/baixar" className="hover:text-emerald-800">App para pacientes</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Acesse</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/login" className="hover:text-emerald-800">Entrar na plataforma</Link>
            <Link href="/cadastro" className="hover:text-emerald-800">Criar conta</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs leading-5 text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <span>© {new Date().getFullYear()} NutriApp. Todos os direitos reservados.</span>
          <span>Preços, limites e telas apresentados neste protótipo são fictícios e ilustrativos.</span>
        </div>
      </div>
    </footer>
  );
}
