'use client'

import Link from "next/link";
import { useState } from "react";
import { Field } from "../../components/auth-forms";
import { apiRequest } from "../../lib/api";
import { AuthShell, FormMessage } from "../../components/auth-shell";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest("/auth/login", { method: "POST", data });
      window.location.href = "/app/dashboard/";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Bem-vindo de volta" description="Entre para acessar seu espaço de atendimento.">
      <form onSubmit={submit} className="space-y-5">
        <FormMessage message={error} error />
        <Field label="E-mail" name="email" type="email" />
        <Field label="Senha" name="senha" type="password" />
        <button
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="flex justify-between text-sm">
          <Link className="text-emerald-700 hover:underline" href="/recuperar-senha/">
            Esqueci minha senha
          </Link>
          <Link className="font-semibold text-slate-700 hover:underline" href="/cadastro/">
            Criar conta
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
