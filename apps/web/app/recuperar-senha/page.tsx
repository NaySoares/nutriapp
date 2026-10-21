'use client'

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../lib/api";
import { AuthShell, FormMessage } from "../../components/auth-shell";
import { Field } from "../../components/auth-forms";

export default function ForgotPasswordPage() {
   const [message, setMessage] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        data: Object.fromEntries(new FormData(event.currentTarget)),
      });
      setMessage("Se o e-mail estiver cadastrado, você receberá as instruções em instantes.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível solicitar a recuperação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Recupere sua senha" description="Informe seu e-mail e enviaremos um link para redefinição.">
      <form onSubmit={submit} className="space-y-5">
        <FormMessage message={error} error />
        <FormMessage message={message} />
        <Field label="E-mail" name="email" type="email" />
        <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {loading ? "Enviando..." : "Enviar instruções"}
        </button>
        <p className="text-center text-sm">
          <Link className="text-emerald-700 hover:underline" href="/login/">Voltar para o login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
