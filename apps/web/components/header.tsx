import Link from "next/link";

function Navlink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block px-6 text-sm font-semibold text-slate-500 transition-all hover:text-emerald-700"
    >
      {children}
    </a>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/50 bg-transparent px-6 py-6 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-widest text-emerald-700"
          >
            Salga App
          </Link>
        </div>

        <nav className="mx-auto flex max-w-3xl items-center justify-between">
          <Navlink href="/">Início</Navlink>
          <Navlink href="/login">Nutricionista</Navlink>
          <Navlink href="/mobile">Paciente</Navlink>
        </nav>
      </div>
    </header>
  );
}