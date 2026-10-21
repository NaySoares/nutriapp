'use client'

import { useState } from "react";
import Link from "next/link";
import { AuthShell, FormMessage } from "../../components/auth-shell";
import { Field } from "../../components/auth-forms";
import { apiRequest } from "../../lib/api";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest("/auth/register", { method: "POST", data });
      setMessage("Conta criada. Redirecionando...");
      setTimeout(() => { window.location.href = "/app/dashboard/"; }, 500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Crie sua conta" description="Comece a organizar seu atendimento nutricional.">
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        <FormMessage message={error} error />
        <FormMessage message={message} />
        <Field label="Nome completo" name="nome" />
        <Field label="E-mail profissional" name="email" type="email" />
        <Field label="Senha (mínimo de 12 caracteres)" name="senha" type="password" />
        <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {loading ? "Criando..." : "Criar conta"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Já possui uma conta?
          <Link className="font-semibold text-emerald-700 hover:underline" href="/login/">
            Entrar
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}