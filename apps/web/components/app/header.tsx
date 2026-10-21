import { Bell, Menu, Plus } from "lucide-react";
import { getCurrentDay } from "../../utils/date";
import { useHeaderStore } from "../../stores/header-store";

type HeaderApp = {
  onMenuClick?: () => void;
}


export function HeaderApp({ onMenuClick }: HeaderApp) {
  const config = useHeaderStore((state) => state.config);

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <button
          className="mobile-menu rounded-lg border border-[#e8eee9] p-2 text-[#496354]"
          aria-label="Abrir menu"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </button>

        <div>
          {config.subtitle && (
            <div className="text-[11px] text-[#849188]">
              {config.subtitle}
            </div>
          )}
          <div className="mt-1 text-[17px] font-bold tracking-[-.45px]">
            {config.title}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {config.actions}
        <button
          aria-label="Notificações"
          onClick={() =>
            alert('Você está em dia: nenhuma nova notificação.')
          }
          className="relative rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"
        >
          <Bell size={16} />
          <span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#d9a354] ring-2 ring-white" />
        </button>
      </div>
    </header>
  )
}