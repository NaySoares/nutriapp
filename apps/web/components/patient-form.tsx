"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FormMessage } from "./auth-shell";

type Patient = {
  id: string;
  nome: string;
  dataNascimento: string;
  sexo: "M" | "F";
  contato: string | null;
  anamnese: string | null;
  arquivadoEm: string | null;
};

export function PatientForm({ patientId }: { patientId?: string }) {
  const editing = Boolean(patientId);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!patientId) return;
    apiFetch<{ paciente: Patient }>(`/patients/${patientId}`)
      .then((result) => setPatient(result.paciente))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Paciente não encontrado."))
      .finally(() => setLoading(false));
  }, [patientId]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const payload = Object.fromEntries(form);
      const result = await apiFetch<{ paciente: Patient }>(
        editing ? `/patients/${patientId}` : "/patients",
        { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) }
      );
      setPatient(result.paciente);
      setMessage(editing ? "Paciente atualizado." : "Paciente cadastrado.");
      if (!editing) window.history.replaceState(null, "", `/app/paciente/?id=${result.paciente.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o paciente.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!patientId || !window.confirm("Arquivar este paciente?")) return;
    setError("");
    try {
      await apiFetch(`/patients/${patientId}/archive`, { method: "POST" });
      setPatient((current) => current ? { ...current, arquivadoEm: new Date().toISOString() } : current);
      setMessage("Paciente arquivado.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível arquivar o paciente.");
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-8"><p>Carregando paciente...</p></main>;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">NutriApp</p>
            <h1 className="mt-2 text-3xl font-bold">{editing ? "Detalhe do paciente" : "Novo paciente"}</h1>
          </div>
          <Link href="/app/pacientes/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Voltar</Link>
        </header>
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <FormMessage message={error} error />
          <FormMessage message={message} />
          <form onSubmit={save} className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-slate-700">Nome
              <input name="nome" defaultValue={patient?.nome ?? ""} required maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Data de nascimento
                <input type="date" name="dataNascimento" defaultValue={patient?.dataNascimento.slice(0, 10) ?? ""} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
              </label>
              <label className="block text-sm font-medium text-slate-700">Sexo
                <select name="sexo" defaultValue={patient?.sexo ?? ""} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                  <option value="" disabled>Selecione</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Contato
              <input name="contato" defaultValue={patient?.contato ?? ""} maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">Anamnese
              <textarea name="anamnese" defaultValue={patient?.anamnese ?? ""} rows={7} maxLength={10000} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <div className="flex flex-wrap gap-3">
              <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar paciente"}</button>
              {patientId && !patient?.arquivadoEm && <button type="button" onClick={archive} className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 hover:bg-red-50">Arquivar</button>}
            </div>
          </form>
          {patient?.arquivadoEm && <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Este paciente está arquivado.</p>}
        </section>
      </div>
    </main>
  );
}
