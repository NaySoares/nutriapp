import { ChevronLeft, ChevronRight } from 'lucide-react';

type WeekNavigatorProps = {
  rangeLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function WeekNavigator({ rangeLabel, onPrevious, onNext, onToday }: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="agenda-secondary" onClick={onToday}>
        Hoje
      </button>
      <div className="flex items-center rounded-lg border border-[#e4eae4] bg-white">
        <button
          type="button"
          aria-label="Semana anterior"
          className="p-2.5 text-[#718278] hover:text-[#287653]"
          onClick={onPrevious}
        >
          <ChevronLeft size={16} />
        </button>
        <span
          aria-live="polite"
          className="border-x border-[#edf1ed] px-3 py-2 text-[11px] font-semibold text-[#53665a]"
        >
          {rangeLabel}
        </span>
        <button
          type="button"
          aria-label="Próxima semana"
          className="p-2.5 text-[#718278] hover:text-[#287653]"
          onClick={onNext}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function WeekNavigatorMinimal({ rangeLabel, onPrevious, onNext, onToday }: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-md border border0[#e9eee9] text-[#78877e] p-1.5 text-[10px] font-semibold"
        onClick={onToday}
      >
        Hoje
      </button>
      <button
        className="rounded-md border border-[#e9eee9] p-1.5 text-[#78877e]"
        aria-label="Semana anterior"
        onClick={onPrevious}
        >
        <ChevronLeft size={15} />
      </button>
      <span className="px-2 text-[10px] font-semibold text-[#637369]">
        {rangeLabel}
      </span>
      <button
        className="rounded-md border border-[#e9eee9] p-1.5 text-[#78877e]"
        aria-label="Próxima semana"
        onClick={onNext}
        >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}