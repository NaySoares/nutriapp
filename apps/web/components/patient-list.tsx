"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FormMessage } from "./auth-shell";

type Patient = {
  id: string;
  nome: string;
  dataNascimento: string;
  sexo: "M" | "F";
  contato: string | null;
  arquivadoEm: string | null;
};

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = useCallback(async (search = "", archived = false) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (archived) params.set("incluirArquivados", "true");
      const result = await apiFetch<{ pacientes: Patient[] }>(`/patients?${params}`);
      setPatients(result.pacientes);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar os pacientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadPatients(query, includeArchived);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">NutriApp</p>
            <h1 className="mt-2 text-3xl font-bold">Pacientes</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/app/paciente/" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Novo paciente
            </Link>
            <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Início
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">Buscar</button>
          </form>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => {
                setIncludeArchived(event.target.checked);
                void loadPatients(query, event.target.checked);
              }}
            />
            Incluir arquivados
          </label>
          <FormMessage message={error} error />

          {loading ? <p className="mt-6 text-slate-500">Carregando pacientes...</p> : (
            <div className="mt-6 divide-y divide-slate-100">
              {patients.map((patient) => (
                <Link key={patient.id} href={`/app/paciente/?id=${patient.id}`} className="block py-4 first:pt-0 hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-semibold">{patient.nome}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Nascimento: {new Date(patient.dataNascimento).toLocaleDateString("pt-BR")}
                        {patient.contato ? ` · ${patient.contato}` : ""}
                      </p>
                    </div>
                    {patient.arquivadoEm && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Arquivado</span>}
                  </div>
                </Link>
              ))}
              {!patients.length && <p className="py-4 text-slate-500">Nenhum paciente encontrado.</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
