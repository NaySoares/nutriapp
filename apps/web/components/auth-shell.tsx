import Link from "next/link";

export function AuthShell({ children, title, description }: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <section className="hidden text-white lg:block">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">NutriApp</Link>
          <h1 className="mt-8 max-w-lg text-5xl font-bold leading-tight">Cuidado nutricional organizado, humano e inteligente.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">Tenha seus pacientes, medições e planos alimentares em um só lugar.</p>
        </section>
        <section className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700 lg:hidden">NutriApp</Link>
          <h2 className="mt-5 text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function FormMessage({ message, error = false }: { message?: string; error?: boolean }) {
  if (!message) return null;
  return <p role={error ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message}</p>;
}
