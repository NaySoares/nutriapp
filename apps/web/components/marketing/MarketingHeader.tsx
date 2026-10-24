"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/#produto", label: "Produto" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/precos", label: "Preços" },
  { href: "/baixar", label: "App do paciente" },
];

function BrandMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none">
        <path d="M19.5 4.5C11 4.5 5 7.2 5 13.2c0 3.1 2.2 5.3 5.1 5.3 6.1 0 9.4-7.2 9.4-14Z" fill="currentColor" opacity=".95" />
        <path d="M3.5 21c3.1-5.1 6.6-8.1 11.7-11.2" stroke="#D1FAE5" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-emerald-950/5 bg-[#fbfcf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="SalgaApp — página inicial" onClick={() => setOpen(false)}>
          <BrandMark />
          <span className="text-xl font-bold tracking-tight text-slate-900">Salga<span className="text-emerald-700">App</span></span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-emerald-800">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white">
            Entrar
          </Link>
          <Link href="/cadastro" className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20">
            Conhecer a plataforma
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 md:hidden"
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-slate-200 bg-[#fbfcf8] px-5 pb-5 pt-2 shadow-xl md:hidden">
          <nav aria-label="Navegação móvel" className="mx-auto flex max-w-7xl flex-col">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50">
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Entrar
              </Link>
              <Link href="/cadastro" onClick={() => setOpen(false)} className="rounded-full bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white">
                Conhecer
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
