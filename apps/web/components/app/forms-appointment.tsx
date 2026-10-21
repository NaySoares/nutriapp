import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { apiRequest } from "../../lib/api";
import type { ATENDIMENTOS, TIPOS_CONSULTA, LOCAIS } from "@nutriapp/shared";

type NewAppointmentPayload = {
  paciente: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  duracao: number; // in minutes
  atendimento: ATENDIMENTOS;
  tipoConsulta: TIPOS_CONSULTA;
  local: LOCAIS;
  note?: string;
}

export function FormsNewAppointment( { onClose, onCreated }: { onClose: () => void; onCreated?: () => void; }) {
  const [newName, setNewName] = useState<string>('');
  const [newDate, setNewDate] = useState(() => new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [newDuration, setNewDuration] = useState<string>('45');
  const [newType, setNewType] = useState<ATENDIMENTOS>('Particular');
  const [newKind, setNewKind] = useState<TIPOS_CONSULTA>('Consulta de retorno');
  const [newLocation, setNewLocation] = useState<LOCAIS>('Consultório');
  const [newTime, setNewTime] = useState('15:00');
  const [loading, setLoading] = useState(false);

  async function addAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim() || loading) return;

    const payload: NewAppointmentPayload = {
      paciente: newName.trim(),
      data: newDate,
      horario: newTime,
      duracao: Number(newDuration),
      atendimento: newType,
      tipoConsulta: newKind,
      local: newLocation,
    };

    setLoading(true);
    try {
      await apiRequest("/agendamentos", { method: "POST", data: payload });
      toast.success("Atendimento agendado com sucesso.");
      onCreated?.();
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Não foi possível criar o agendamento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-appointment-title"
      className="my-auto w-full max-w-[520px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
            AGENDAMENTO
          </div>
          <h2
            id="new-appointment-title"
            className="text-[20px] font-bold tracking-[-.5px] text-[#20352c]"
          >
            Novo Atendimento
          </h2>
          <p className="mt-1 text-[11px] text-[#87948b]">
            Crie um horário na sua agenda.
          </p>
        </div>
      </div>
      <form onSubmit={addAppointment} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
            Nome do paciente <span className="text-[#b65c50]">*</span>
          </span>
          <input
            required
            autoFocus
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Digite o nome do paciente"
            className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Data
            </span>
            <input
              required
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
              className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Horário
            </span>
            <input
              required
              type="time"
              value={newTime}
              onChange={(event) => setNewTime(event.target.value)}
              className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Duração
            </span>
            <select
              value={newDuration}
              onChange={(event) => setNewDuration(event.target.value)}
              className="agenda-select w-full"
            >
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="50">50 minutos</option>
              <option value="60">60 minutos</option>
              <option value="90">90 minutos</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Atendimento
            </span>
            <select
              value={newType}
              onChange={(event) =>
                setNewType(event.target.value as ATENDIMENTOS)
              }
              className="agenda-select w-full"
            >
              <option>Particular</option>
              <option>Hospitalar</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
            Tipo de consulta
          </span>
          <select
            value={newKind}
            onChange={(event) => setNewKind(event.target.value as TIPOS_CONSULTA)}
            className="agenda-select w-full"
          >
            <option>Consulta de retorno</option>
            <option>Avaliação nutricional</option>
            <option>Acompanhamento</option>
            <option>Revisão do plano</option>
            <option>Primeira consulta</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
            Local
          </span>
          <select
            value={newLocation}
            onChange={(event) => setNewLocation(event.target.value as LOCAIS)}
            className="agenda-select w-full"
          >
            <option>Consultório</option>
            <option>Online</option>
            <option>Hospital</option>
          </select>
        </label>
        <p className="rounded-lg bg-[#f6f9f6] p-3 text-[10px] leading-4 text-[#7d8b83]">
          A consulta ficará como “Aguardando confirmação”. É necessário confirmar a consulta antes do início do atendimento.
        </p>
        <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
          <button
            type="button"
            className="agenda-secondary"
            onClick={() => onClose()}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="agenda-primary" disabled={loading}>
            <Plus size={14} />
            {loading ? "Salvando..." : "Adicionar à agenda"}
          </button>
        </div>
      </form>
    </div>
  );
}