"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FormMessage } from "./auth-shell";

type Profile = { id: string; email: string; nome: string; crn: string | null; logoPath: string | null };

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  useEffect(() => { apiFetch<{ nutricionista: Profile }>("/me").then((result) => setProfile(result.nutricionista)).catch((reason) => setError(reason instanceof Error ? reason.message : "Faça login para acessar o perfil.")).finally(() => setLoading(false)); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!profile) return; setSaving(true); setError(""); setMessage(""); try { const result = await apiFetch<{ nutricionista: Profile }>("/me", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setProfile(result.nutricionista); setMessage("Perfil atualizado."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar."); } finally { setSaving(false); } }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; setError(""); setMessage(""); const data = new FormData(); data.append("logo", file); try { const result = await apiFetch<{ nutricionista: Profile }>("/me/logo", { method: "POST", body: data }); setProfile(result.nutricionista); setMessage("Logo enviada com sucesso."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível enviar a logo."); } }
  if (loading) return <main className="min-h-screen bg-slate-50 p-8"><p className="mx-auto max-w-3xl text-slate-500">Carregando perfil...</p></main>;
  return <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900"><div className="mx-auto max-w-3xl">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">NutriApp</p><h1 className="mt-2 text-3xl font-bold">Meu perfil</h1></div><Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Início</Link></header>
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm"><FormMessage message={error} error /><FormMessage message={message} />
      {profile ? <><form onSubmit={save} className="mt-5 space-y-5"><label className="block text-sm font-medium text-slate-700">Nome<input name="nome" defaultValue={profile.nome} required maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /></label><label className="block text-sm font-medium text-slate-700">CRN<input name="crn" defaultValue={profile.crn ?? ""} maxLength={30} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /></label><p className="text-sm text-slate-500">E-mail: {profile.email}</p><button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar alterações"}</button></form><div className="mt-10 border-t border-slate-100 pt-7"><h2 className="font-semibold">Logo profissional</h2><p className="mt-1 text-sm text-slate-500">PNG, JPEG ou WebP, com até 5 MB.</p><input className="mt-4 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />{profile.logoPath && <p className="mt-3 text-xs text-slate-500">Arquivo armazenado: {profile.logoPath}</p>}</div></> : <div><p className="text-slate-600">Sua sessão não está ativa.</p><Link className="mt-4 inline-block font-semibold text-emerald-700 hover:underline" href="/login/">Voltar para o login</Link></div>}
    </section></div></main>;
}
