'use client'

import { useState } from "react";
import Link from "next/link";
import { FormMessage } from "../../components/auth-shell";
import { Field } from "../../components/auth-forms";
import { AuthShell } from "../../components/auth-shell";
import { apiRequest } from "../../lib/api";
export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest("/auth/reset-password", { method: "POST", data });
      setMessage("Senha redefinida. Você já pode entrar.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Link inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Redefina sua senha" description="Escolha uma nova senha para sua conta.">
    <form onSubmit={submit} className="space-y-5">
      <FormMessage message={error} error />
      <FormMessage message={message} />
      <Field label="Token recebido por e-mail" name="token" />
      <Field label="Nova senha (mínimo de 12 caracteres)" name="novaSenha" type="password" />
      <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {loading ? "Salvando..." : "Redefinir senha"}
      </button>
      <p className="text-center text-sm">
        <Link className="text-emerald-700 hover:underline" href="/login/">Ir para o login</Link>
      </p>
    </form>
  </AuthShell>
  )
}
