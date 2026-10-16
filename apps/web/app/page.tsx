import { API_BASE_URL } from "@nutriapp/shared";
import { ApiStatus } from "../components/api-status";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">NutriApp</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Fundação pronta para a gestão nutricional.</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A base estática do aplicativo usa a API na mesma origem, com o prefixo <code>{API_BASE_URL}</code>.
        </p>
        <ApiStatus />
      </div>
    </main>
  );
}
