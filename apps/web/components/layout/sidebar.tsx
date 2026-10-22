import { useState } from "react";
import { Apple, ArrowRight, HeartPulse, MoreHorizontal, Settings, X, LayoutDashboard, Users, CalendarDays, Wallet, Utensils, FileUser, FileText } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';

type INutritionData = {
  name: string;
  role: string;
  initials: string;
};

const navGroups = [
  {
    title: "ESPAÇO DE TRABALHO",
    items: [
      { label: "Visão geral", icon: LayoutDashboard, href: "/app/dashboard" },
      { label: "Pacientes", icon: Users, href: "/app/pacientes" },
      { label: "Agenda", icon: CalendarDays, href: "/app/agenda" },
      { label: "Alimentos", icon: Apple, href: "/app/alimentos" },
      { label: "Refeições", icon: Utensils, href: "/app/refeicoes" },
      { label: "Planos alimentares", icon: FileUser, href: "/app/planos" }
    ]
  },
  {
    title: "GESTÃO",
    items: [
      { label: "Financeiro", icon: Wallet, href: "/app/financeiro" },
      { label: "Relatórios", icon: FileText, href: "/app/relatorios" },
    ]
  }
];

const SETTINGS_HREF = "/app/configuracoes";

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function SideBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notice, setNotice] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const titleSideBar = "Salga App";
  const nutritionData: INutritionData = {
    name: "Dra. Vanessa Soares",
    role: "Nutricionista clínica",
    initials: "VS"
  }

  const goTo = (href: string) => {
    if (open) onClose();
    router.push(href);
  };

  return (
    <>
    {open && <button aria-label="Fechar menu" className="fixed inset-0 z-10 bg-black/20 md:hidden" onClick={onClose} />}
    <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="brand-mark">
            <Apple size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[20px] font-bold tracking-[-.8px]">
              {titleSideBar}<span className="text-[#4a9569]">.</span>
            </div>
            <div className="text-[10px] tracking-[1.2px] text-[#8b9990]">
              GESTÃO CLÍNICA
            </div>
          </div>

          <button
            className="ml-auto text-[#8b9990] md:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {navGroups.map((group) =>
        <div key={group.title} className="mb-7">
          <div className="mb-2 px-3 text-[9px] font-bold tracking-[1.25px] text-[#a1aca5]">{group.title}</div>
          <nav className="space-y-1">
            {group.items.map(({ label, icon: Icon, href }) =>
              <button
                key={label}
                onClick={() => {
                  goTo(href)
                }}
                className={`nav-item ${isActive(pathname, href) ? "active" : ""}`}
              >
                <Icon
                  size={17}
                  strokeWidth={1.8}
                />
                  <span>{label}</span>{label === "Agenda" && <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] text-[#718278]">4</span>}
              </button>
            )}
          </nav>
        </div>)}

        <div className="mt-auto">
          <div className="mb-5 rounded-xl bg-[#f5f8f5] p-3.5">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#355743]">
              <HeartPulse size={15} />Seu espaço em dia
            </div>
            <p className="mb-3 text-[10px] leading-[1.6] text-[#87948b]">
              Mantenha os prontuários atualizados para acompanhar melhor cada evolução.
            </p>
            <button
              onClick={() => setNotice("Checklist de prontuários aberto no protótipo.")}
              className="flex items-center gap-1 text-[10px] font-bold text-[#287653]">
                Ver checklist
                <ArrowRight size={12} />
            </button>
          </div>

          <button
            onClick={() => goTo(SETTINGS_HREF)}
            className={`nav-item mb-4 ${isActive(pathname, SETTINGS_HREF) ? "active" : ""}`}
          >
            <Settings size={17} /><span>Configurações</span>
          </button>

          <div className="flex items-center gap-3 border-t border-[#edf1ed] px-2 pt-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dcecdf] text-[11px] font-bold text-[#2e6948]">
              {nutritionData.initials}
            </div>
            <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-bold">
              {nutritionData.name}
            </div>
            <div className="mt-0.5 text-[10px] text-[#87948b]">
              {nutritionData.role}
            </div>
          </div>
          <button
            aria-label="Opções do perfil"
            onClick={() => setNotice("Perfil de demonstração: Dra. Vanessa Soares.")}
            className="text-[#8b9990]"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </aside>
  </>
  );
}