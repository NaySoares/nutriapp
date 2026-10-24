import { getCurrentDay } from "../../utils/date";

function TinyBars() {
  const heights = [34, 48, 39, 62, 47, 76, 54, 69, 84, 60, 73, 92];
  return (
    <div className="flex h-28 items-end gap-2" aria-label="Gráfico demonstrativo de recebimentos">
      {heights.map((height, index) => (
        <div key={index} className="flex-1 rounded-t-md bg-emerald-600/80" style={{ height: `${height}%`, opacity: 0.45 + (index / heights.length) * 0.5 }} />
      ))}
    </div>
  );
}

export default function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[610px]">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-emerald-200/35 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_90px_-38px_rgba(15,70,49,0.38)]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-700 text-xs font-bold text-white">S</span>
            <div>
              <p className="text-xs font-bold text-slate-900">SalgaApp <span className="font-normal text-slate-400">/ Visão geral</span></p>
              <p className="mt-0.5 text-[10px] text-slate-500">{getCurrentDay()}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">Demonstração</span>
        </div>
        <div className="grid gap-4 bg-[#f8faf7] p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Consultas hoje", value: "08", change: "2 próximas" },
              { label: "Pacientes ativos", value: "124", change: "Carteira demonstrativa" },
              { label: "Recebido no mês", value: "R$ 8.420", change: "Valor ilustrativo" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-100 bg-white p-3.5">
                <p className="text-[10px] font-medium text-slate-500">{metric.label}</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">{metric.value}</p>
                <p className="mt-1 text-[9px] text-emerald-700">{metric.change}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.25fr_.75fr]">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Visão financeira</p>
                  <p className="mt-1 text-[10px] text-slate-500">Recebimentos ilustrativos</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-800">Este mês</span>
              </div>
              <div className="mt-4"><TinyBars /></div>
              <div className="mt-2 flex justify-between text-[9px] text-slate-400"><span>01 out.</span><span>31 out.</span></div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-900">Próximas consultas</p>
              <div className="mt-4 space-y-3">
                {[
                  { time: "09:00", name: "Mariana Costa", type: "Retorno", color: "bg-emerald-100 text-emerald-800" },
                  { time: "10:30", name: "Lucas Mendes", type: "Avaliação", color: "bg-amber-100 text-amber-800" },
                  { time: "14:00", name: "Ana Ribeiro", type: "Acompanhamento", color: "bg-sky-100 text-sky-800" },
                ].map((item) => (
                  <div key={item.name} className="flex gap-2.5">
                    <span className="pt-0.5 text-[9px] font-semibold text-slate-500">{item.time}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-slate-800">{item.name}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-medium ${item.color}`}>{item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] text-slate-400">Dados de exemplo — não representam pacientes ou movimentações reais.</p>
        </div>
      </div>
    </div>
  );
}
