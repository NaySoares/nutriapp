import { DAYS_SHORT } from '../../utils/date';

type DayStripProps = {
  weekDates: string[]; // 7 datas YYYY-MM-DD
  selectedDate: string;
  today?: string;
  onSelectDate: (date: string) => void;
  /** Esconde sábado e domingo */
  hideWeekends?: boolean;
};

const isWeekend = (date: string) => {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = domingo, 6 = sábado
  return day === 0 || day === 6;
};

export function DayStrip({ weekDates, selectedDate, today, onSelectDate, hideWeekends = false }: DayStripProps) {
  return (
    <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
      {weekDates.map((date, index) => {
        if (hideWeekends && isWeekend(date)) return null;
        const active = date === selectedDate;
        return (
          <button
            key={date}
            type="button"
            aria-pressed={active}
            aria-label={new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            onClick={() => onSelectDate(date)}
            className={`min-w-[51px] flex-1 rounded-lg border px-2 py-2.5 text-center ${
              active ? 'border-[#2d8057] bg-[#eaf5ed]' : 'border-[#edf1ed] bg-white hover:bg-[#f7faf7]'
            }`}
          >
            <div className={`text-[9px] font-bold tracking-wide ${active ? 'text-[#2d8057]' : 'text-[#9aa69e]'}`}>
              {DAYS_SHORT[index]?.toUpperCase()}
            </div>
            <div className={`mt-1 text-[15px] font-bold ${active ? 'text-[#245c3d]' : 'text-[#516459]'}`}>
              {Number(date.slice(8, 10))}
            </div>
            <span
              className={`mx-auto mt-1 block h-1 w-1 rounded-full bg-[#2d8057] ${date === today ? '' : 'invisible'}`}
            />
          </button>
        );
      })}
    </div>
  );
}