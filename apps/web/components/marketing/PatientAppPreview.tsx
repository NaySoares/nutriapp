export default function PatientAppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-8 rounded-full bg-lime-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-[286px] rounded-[2.8rem] border-[7px] border-slate-900 bg-slate-900 p-1.5 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.5)]">
        <div className="overflow-hidden rounded-[2.25rem] bg-[#f8faf5]">
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <span className="text-[10px] font-semibold text-slate-500">9:41</span>
            <span className="h-4 w-20 rounded-full bg-slate-900" />
            <span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-slate-400" /><i className="h-2 w-2 rounded-full bg-slate-400" /><i className="h-2 w-3 rounded-sm bg-slate-400" /></span>
          </div>
          <div className="px-4 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Olá,</p>
                <p className="text-lg font-bold tracking-tight text-slate-900">Mariana</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-800">MC</div>
            </div>
            <div className="mt-4 rounded-2xl bg-emerald-800 p-4 text-white">
              <p className="text-[10px] font-medium text-emerald-100">Seu plano alimentar</p>
              <p className="mt-1 text-base font-bold">Uma rotina equilibrada</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-lime-300" /></div>
                <span className="text-[9px] font-semibold">Exemplo</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">Hoje</p>
              <p className="text-[9px] text-slate-500">Quarta, 21 out.</p>
            </div>
            <div className="mt-2 space-y-2">
              {[
                { time: "08:00", meal: "Café da manhã", food: "Iogurte, frutas e aveia", done: true },
                { time: "12:30", meal: "Almoço", food: "Arroz, feijão e legumes", done: false },
                { time: "16:00", meal: "Lanche", food: "Fruta e castanhas", done: false },
              ].map((item) => (
                <div key={item.meal} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${item.done ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 text-transparent"}`}>
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 8 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold text-emerald-700">{item.time}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-900">{item.meal}</p>
                    <p className="mt-1 text-[9px] leading-4 text-slate-500">{item.food}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-white p-3 text-center">
              <div><p className="text-sm font-bold text-slate-900">2</p><p className="mt-1 text-[8px] text-slate-500">Refeições</p></div>
              <div className="border-x border-slate-100"><p className="text-sm font-bold text-slate-900">1</p><p className="mt-1 text-[8px] text-slate-500">Concluída</p></div>
              <div><p className="text-sm font-bold text-slate-900">100%</p><p className="mt-1 text-[8px] text-slate-500">Exemplo</p></div>
            </div>
            <p className="mt-3 text-center text-[8px] text-slate-400">Prévia ilustrativa do aplicativo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
