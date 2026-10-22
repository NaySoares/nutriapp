import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 py-4 text-center text-sm text-slate-500 flex items-center justify-between">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold hover:text-emerald-700">Feito por <strong>AxiosLab</strong></Link>
        <p>
        &copy; {new Date().getFullYear()} Salga App. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}