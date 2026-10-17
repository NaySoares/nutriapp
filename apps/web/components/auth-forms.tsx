"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { AuthShell, FormMessage } from "./auth-shell";

function Field({ label, type = "text", name, required = true }: { label: string; type?: string; name: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
    </label>
  );
}

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));

    try { await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }); window.location.href = "/app/perfil/"; }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível entrar."); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell title="Bem-vindo de volta" description="Entre para acessar seu espaço de atendimento.">
      <form onSubmit={submit} className="space-y-5">
        <FormMessage message={error} error />
        <Field label="E-mail" name="email" type="email" />
        <Field label="Senha" name="senha" type="password" />
        <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Entrando..." : "Entrar"}</button>
        <div className="flex justify-between text-sm"><Link className="text-emerald-700 hover:underline" href="/recuperar-senha/">Esqueci minha senha</Link><Link className="font-semibold text-slate-700 hover:underline" href="/cadastro/">Criar conta</Link></div>
      </form>
    </AuthShell>
  )
}

export function RegisterForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }); setMessage("Conta criada. Redirecionando..."); setTimeout(() => { window.location.href = "/app/perfil/"; }, 500); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível criar sua conta."); } finally { setLoading(false); }
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
        <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? "Criando..." : "Criar conta"}</button>
        <p className="text-center text-sm text-slate-500">Já possui uma conta? <Link className="font-semibold text-emerald-700 hover:underline" href="/login/">Entrar</Link></p>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
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

export function ResetPasswordForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { await apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }); setMessage("Senha redefinida. Você já pode entrar."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Link inválido ou expirado."); } finally { setLoading(false); }
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
