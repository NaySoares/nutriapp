"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FormMessage } from "./auth-shell";

type Settings = {
  formulaPadrao: "mifflin" | "harris_benedict";
  fatoresAtividade: Record<string, number>;
};

const levels = [
  ["sedentario", "Sedentário"],
  ["leve", "Leve"],
  ["moderado", "Moderado"],
  ["ativo", "Ativo"],
  ["muito_ativo", "Muito ativo"]
] as const;

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ configuracoes: Settings }>("/me/settings")
      .then((result) => setSettings(result.configuracoes))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Não foi possível carregar as configurações."));
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const fatoresAtividade = Object.fromEntries(
        levels.map(([key]) => [key, Number(form.get(key))])
      );
      const result = await apiFetch<{ configuracoes: Settings }>("/me/settings", {
        method: "PATCH",
        body: JSON.stringify({
          formulaPadrao: form.get("formulaPadrao"),
          fatoresAtividade
        })
      });
      setSettings(result.configuracoes);
      setMessage("Configurações salvas.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">NutriApp</p>
            <h1 className="mt-2 text-3xl font-bold">Configurações de cálculo</h1>
          </div>
          <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Início</Link>
        </header>
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <FormMessage message={error} error />
          <FormMessage message={message} />
          {settings ? (
            <form onSubmit={save} className="mt-5 space-y-6">
              <label className="block text-sm font-medium text-slate-700">
                Fórmula padrão para TMB
                <select name="formulaPadrao" defaultValue={settings.formulaPadrao} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <option value="mifflin">Mifflin-St Jeor</option>
                  <option value="harris_benedict">Harris-Benedict revisada</option>
                </select>
              </label>
              <div>
                <h2 className="font-semibold">Fatores de atividade</h2>
                <p className="mt-1 text-sm text-slate-500">Esses valores serão usados nas próximas medições.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {levels.map(([key, label]) => (
                    <label key={key} className="text-sm font-medium text-slate-700">
                      {label}
                      <input name={key} type="number" min="0.01" step="0.001" required defaultValue={settings.fatoresAtividade[key]} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
                    </label>
                  ))}
                </div>
              </div>
              <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar configurações"}</button>
            </form>
          ) : !error && <p className="mt-5 text-slate-500">Carregando configurações...</p>}
        </section>
      </div>
    </main>
  );
}
