import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { ATENDIMENTOS, TIPOS_CONSULTA, LOCAIS, Sex } from "@nutriapp/shared";
import { isDateInPast } from "../../utils/date";

type Atendimento = (typeof ATENDIMENTOS)[number];
type TipoConsulta = (typeof TIPOS_CONSULTA)[number];
type Local = (typeof LOCAIS)[number];

type NewAppointmentPayload = {
  paciente: string;
  data: string; // YYYY-MM-DD
  dataNascimento: string; // YYYY-MM-DD
  sexo: Sex;
  horario: string; // HH:mm
  duracao: number; // in minutes
  atendimento: Atendimento;
  tipoConsulta: TipoConsulta;
  local: Local;
  note?: string;
  contato?: string;
}

export function FormsNewAppointment( { onClose, onCreated }: { onClose: () => void; onCreated?: () => void; }) {
  const [newName, setNewName] = useState<string>('');
  const [newDate, setNewDate] = useState(() => new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [newDuration, setNewDuration] = useState<string>('45');
  const [newType, setNewType] = useState<Atendimento>('Particular');
  const [newKind, setNewKind] = useState<TipoConsulta>('Consulta de retorno');
  const [newLocation, setNewLocation] = useState<Local>('Consultório');
  const [newTime, setNewTime] = useState('15:00');
  const [newBirthDate, setNewBirthDate] = useState(() => new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [newSex, setNewSex] = useState<Sex>('M');
  const [newContact, setNewContact] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function addAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim() || loading) return;

    if (isDateInPast(newDate)) {
      toast.error("A data do agendamento não pode ser no passado.");
      return;
    }

    const payload: NewAppointmentPayload = {
      paciente: newName.trim(),
      data: newDate,
      horario: newTime,
      duracao: Number(newDuration),
      atendimento: newType,
      tipoConsulta: newKind,
      local: newLocation,
      dataNascimento: newBirthDate,
      sexo: newSex,
      contato: newContact?.trim() || undefined,
    };

    setLoading(true);
    try {
      await apiRequest("/appointments", { method: "POST", data: payload });
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
            id="appointment-name-input"
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
              Data de Nascimento <span className="text-[#b65c50]">*</span>
            </span>
            <input
              id="appointment-birthdate-input"
              required
              type="date"
              value={newBirthDate}
              onChange={(event) => setNewBirthDate(event.target.value)}
              className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Sexo <span className="text-[#b65c50]">*</span>
            </span>
            <select
              value={newSex}
              onChange={(event) => setNewSex(event.target.value as Sex)}
              id="appointment-sex-select"
              className="agenda-select w-full"
              style={{ minHeight: "42px" }}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
            Contato <span className="text-[#b65c50]">*</span>
          </span>
          <input
            id="appointment-contact-input"
            required
            value={newContact}
            onChange={(event) => setNewContact(event.target.value)}
            placeholder="Digite o contato do paciente"
            className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Data
            </span>
            <input
              id="appointment-date-input"
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
              id="appointment-time-input"
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
              id="appointment-duration-select"
              value={newDuration}
              onChange={(event) => setNewDuration(event.target.value)}
              className="w-full"
              style={{ border: "1px solid #e4eae4", borderRadius: "9px", background: "white", padding: "9px 11px", fontSize: "11px", color: "#607166", outline: "none" }}
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
              id="appointment-type-select"
              value={newType}
              onChange={(event) =>
                setNewType(event.target.value as Atendimento)
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
            id="appointment-kind-select"
            value={newKind}
            onChange={(event) => setNewKind(event.target.value as TipoConsulta)}
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
            id="appointment-location-select"
            value={newLocation}
            onChange={(event) => setNewLocation(event.target.value as Local)}
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