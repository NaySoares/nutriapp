"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { FormMessage } from "./auth-shell";

type Measurement = {
  id: string;
  data: string;
  pesoKg: number | string;
  alturaCm: number | string;
  circunferencias: Record<string, number> | null;
  nivelAtividade: string;
  tmbKcal: number | string;
  getKcal: number | string;
  imc: number | string;
  formulaUsada: "mifflin" | "harris_benedict";
  fatorUsado: number | string;
};

const activityLabels: Record<string, string> = {
  sedentario: "Sedentário",
  leve: "Leve",
  moderado: "Moderado",
  ativo: "Ativo",
  muito_ativo: "Muito ativo"
};

export function MeasurementPanel({ patientId }: { patientId: string }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lastSaved, setLastSaved] = useState<Measurement | null>(null);
  const [formValues, setFormValues] = useState({
    data: new Date().toISOString().slice(0, 10),
    pesoKg: "",
    alturaCm: "",
    nivelAtividade: "moderado"
  });

  const loadMeasurements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch<{ medicoes: Measurement[] }>(`/patients/${patientId}/measurements`);
      setMeasurements(result.medicoes);
      const latest = result.medicoes[0];
      if (latest) {
        setFormValues((current) => ({
          ...current,
          pesoKg: String(latest.pesoKg),
          alturaCm: String(latest.alturaCm),
          nivelAtividade: latest.nivelAtividade
        }));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar as medições.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadMeasurements();
  }, [loadMeasurements]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const result = await apiFetch<{ medicao: Measurement }>(
        `/patients/${patientId}/measurements`,
        { method: "POST", body: JSON.stringify({
          ...values,
          pesoKg: Number(values.pesoKg),
          alturaCm: Number(values.alturaCm)
        }) }
      );
      setLastSaved(result.medicao);
      setMeasurements((current) => [result.medicao, ...current].sort((a, b) => b.data.localeCompare(a.data)));
      setMessage("Medição salva e indicadores calculados.");
      setFormValues((current) => ({
        ...current,
        pesoKg: String(result.medicao.pesoKg),
        alturaCm: String(result.medicao.alturaCm),
        nivelAtividade: result.medicao.nivelAtividade,
        data: new Date().toISOString().slice(0, 10)
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a medição.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir esta medição?")) return;
    setError("");
    try {
      await apiFetch(`/measurements/${id}`, { method: "DELETE" });
      setMeasurements((current) => current.filter((measurement) => measurement.id !== id));
      if (lastSaved?.id === id) setLastSaved(null);
      setMessage("Medição excluída.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível excluir a medição.");
    }
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <div>
        <h2 className="mt-2 text-2xl font-bold">Medições</h2>
        <p className="mt-1 text-sm text-slate-500">Registre os dados e acompanhe a evolução do paciente.</p>
      </div>
      <div className="mt-5">
        <FormMessage message={error} error />
        <FormMessage message={message} />
      </div>

      <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">
          Data
          <input
            type="date"
            name="data"
            value={formValues.data}
            onChange={(event) => setFormValues({ ...formValues, data: event.target.value })}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Peso (kg)
          <input
            type="number"
            name="pesoKg"
            value={formValues.pesoKg}
            onChange={(event) => setFormValues({ ...formValues, pesoKg: event.target.value })}
            min="2"
            max="500"
            step="0.01"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Altura (cm)
          <input
            type="number"
            name="alturaCm"
            value={formValues.alturaCm}
            onChange={(event) => setFormValues({ ...formValues, alturaCm: event.target.value })}
            min="50"
            max="250"
            step="0.01"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Atividade
          <select
            name="nivelAtividade"
            value={formValues.nivelAtividade}
            onChange={(event) => setFormValues({ ...formValues, nivelAtividade: event.target.value })}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500">
              {Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <button
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 sm:col-span-2 lg:col-span-4"
        >
          {saving ? "Calculando..." : "Salvar medição e calcular"}
        </button>
      </form>

      {lastSaved && <MetricCards measurement={lastSaved} />}
      {!lastSaved && measurements[0] && <MetricCards measurement={measurements[0]} />}

      {loading ? <p className="mt-8 text-sm text-slate-500">Carregando histórico...</p> : (
        <>
          <MeasurementChart measurements={measurements} />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-3">Data</th><th className="px-3 py-3">Peso</th><th className="px-3 py-3">IMC</th><th className="px-3 py-3">TMB</th><th className="px-3 py-3">GET</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {measurements.map((measurement) => (
                  <tr key={measurement.id}>
                    <td className="px-3 py-3">{new Date(measurement.data).toLocaleDateString("pt-BR")}</td>
                    <td className="px-3 py-3">{formatNumber(measurement.pesoKg)} kg</td>
                    <td className="px-3 py-3">{formatNumber(measurement.imc)}</td>
                    <td className="px-3 py-3">{formatNumber(measurement.tmbKcal)} kcal</td>
                    <td className="px-3 py-3">{formatNumber(measurement.getKcal)} kcal</td>
                    <td className="px-3 py-3 text-right"><button onClick={() => remove(measurement.id)} className="text-red-700 hover:underline">Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!measurements.length && <p className="py-6 text-sm text-slate-500">Nenhuma medição registrada.</p>}
          </div>
        </>
      )}
    </section>
  );
}

function MetricCards({ measurement }: { measurement: Measurement }) {
  const bmi = Number(measurement.imc);
  const bmiClassification = classifyBmi(bmi);
  const snapshot = `${measurement.formulaUsada === "mifflin" ? "Mifflin" : "Harris-Benedict"} · fator ${formatNumber(measurement.fatorUsado)}`;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[["TMB", `${formatNumber(measurement.tmbKcal)} kcal`], ["GET", `${formatNumber(measurement.getKcal)} kcal`]].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">IMC</p>
        <p className="mt-2 text-xl font-bold text-slate-900">{formatNumber(measurement.imc)}</p>
        <p className={`mt-1 text-sm font-semibold ${bmiClassification.color}`}>{bmiClassification.label}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Snapshot</p>
        <p className="mt-2 text-xl font-bold text-slate-900">{snapshot}</p>
      </div>
    </div>
  );
}

function classifyBmi(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-700" };
  if (bmi < 25) return { label: "Peso adequado", color: "text-emerald-700" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-700" };
  if (bmi < 35) return { label: "Obesidade grau 1", color: "text-orange-700" };
  if (bmi < 40) return { label: "Obesidade grau 2", color: "text-red-700" };
  return { label: "Obesidade grau 3", color: "text-red-900" };
}

function MeasurementChart({ measurements }: { measurements: Measurement[] }) {
  const points = useMemo(() => [...measurements].sort((a, b) => a.data.localeCompare(b.data)), [measurements]);
  if (points.length < 2) return null;
  const width = 720;
  const height = 320;
  const padding = 32;
  const weights = points.map((point) => Number(point.pesoKg));
  const bmis = points.map((point) => Number(point.imc));
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const minBmi = Math.min(...bmis);
  const maxBmi = Math.max(...bmis);
  const x = (index: number) => padding + (index * (width - padding * 2)) / (points.length - 1);
  const chartY = (value: number, min: number, max: number, top: number, bottom: number) => {
    const range = max === min ? 1 : max - min;
    return bottom - ((value - min) * (bottom - top)) / range;
  };
  const weightLine = points.map((point, index) => `${x(index)},${chartY(Number(point.pesoKg), minWeight, maxWeight, padding + 24, 132)}`).join(" ");
  const bmiLine = points.map((point, index) => `${x(index)},${chartY(Number(point.imc), minBmi, maxBmi, 184, 292)}`).join(" ");

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Evolução</h3>
        <p className="text-xs text-slate-500">
          <span className="text-emerald-600">
            ● Peso (kg)
          </span>
           ·
          <span className="text-blue-600">
            ● IMC
          </span>
        </p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-80 min-w-[620px] w-full"
          role="img"
          aria-label="Gráficos de evolução de peso e IMC"
        >
          <text
            x={padding}
            y="18"
            className="fill-emerald-700 text-xs font-semibold"
          >
            Peso (kg)
          </text>
          <polyline points={weightLine} fill="none" stroke="#059669" strokeWidth="3" />
          {points.map((point, index) => <circle key={`weight-${point.id}`} cx={x(index)} cy={chartY(Number(point.pesoKg), minWeight, maxWeight, padding + 24, 132)} r="4" fill="#059669" />)}

          <text
            x={padding}
            y="178"
            className="fill-blue-700 text-xs font-semibold"
          >
            IMC
          </text>
          <polyline points={bmiLine} fill="none" stroke="#2563eb" strokeWidth="3" />
          {points.map((point, index) => <g key={`bmi-${point.id}`}><circle cx={x(index)} cy={chartY(Number(point.imc), minBmi, maxBmi, 184, 292)} r="4" fill="#2563eb" /><text x={x(index)} y="312" textAnchor="middle" className="fill-slate-500 text-[10px]">{new Date(point.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</text></g>)}
        </svg>
      </div>
    </div>
  )
}

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
