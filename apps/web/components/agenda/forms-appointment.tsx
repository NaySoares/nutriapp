import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { ATENDIMENTOS, TIPOS_CONSULTA, LOCAIS, Sex, ATENDIMENTOS_LABELS, TIPOS_CONSULTA_LABELS, LOCAIS_LABELS, AppointmentCreateInput, PatientRecord, PatientPage, DURATION_APPOINTMENT_LABELS, DURATION_APPOINTMENT, AppointmentRecord } from "@nutriapp/shared";
import { isDateInPast } from "../../utils/date";
import { useAppointmentContext } from "../../stores/appointment-store";
import { Autocomplete } from "../ui/autocomplete";
import { InputDate, InputSelect, InputSex, InputText, InputTime } from "../ui/input";

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

type FormsNewAppointmentProps = {
  data?: AppointmentCreateInput;
  onClose: () => void;
  onCreated?: (appointment: AppointmentRecord) => void;
};

export function FormsNewAppointment( { data, onClose, onCreated }: FormsNewAppointmentProps) {
  const [newName, setNewName] = useState<string>('');
  const [newDate, setNewDate] = useState(() => new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [newDuration, setNewDuration] = useState<string>('45');
  const [newType, setNewType] = useState<Atendimento>('particular');
  const [newKind, setNewKind] = useState<TipoConsulta>('consulta_de_retorno');
  const [newLocation, setNewLocation] = useState<Local>('consultorio');
  const [newTime, setNewTime] = useState('14:00');
  const [newBirthDate, setNewBirthDate] = useState(() => new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [newSex, setNewSex] = useState<Sex>('M');
  const [newContact, setNewContact] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [selectedPatient, setSelectedPatient] =
  useState<PatientRecord | null>(null);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  function handlePatientSelect(patient: PatientRecord) {
    setSelectedPatient(patient);
    setIsEditable(false);
    setNewName(patient.nome);
    setNewBirthDate(
      new Date(patient.dataNascimento).toLocaleDateString("en-CA")
    );
    setNewSex(patient.sexo);
    setNewContact(patient.contato || "");
  }

  const patientAppointment = useAppointmentContext((state) => state.patient);
  const clearPatient = useAppointmentContext((state) => state.clearPatient);

  useEffect(() => {
    if (!data) {
      return;
    }
    setNewDate(data.data);
  }, [data]);

  useEffect(() => {
    if (!patientAppointment) return;

    setNewName(patientAppointment.nome);
    setNewBirthDate(
      new Date(patientAppointment.dataNascimento).toLocaleDateString("en-CA")
    );
    setNewSex(patientAppointment.sexo);
    setNewContact(patientAppointment.contato || "");
  }, [patientAppointment]);

  const fetchPatients = useCallback(
    async (query: string, signal: AbortSignal) => {
      const response = await apiRequest<{ pacientes: PatientPage }>(
        `/patients?q=${encodeURIComponent(query)}&page=1&pageSize=10`,
        { signal }
      );

      return response.pacientes.items;
    },
    []
  );

  async function addAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim() || loading) return;

    if (isDateInPast(newDate, newTime)) {
      toast.error("Só são permitidos agendamentos para datas futuras.");
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
      const response = await apiRequest<{ agendamento: AppointmentRecord }>("/appointments", { method: "POST", data: payload });

      onCreated?.(response.agendamento!);
      toast.success("Atendimento agendado com sucesso.");
      clearPatient();
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Não foi possível criar o agendamento."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChangePatient() {
    setIsEditable(false);
    setNewName("");
    setSelectedPatient(null);
    setIsEditable(true);
    setNewBirthDate(new Date().toLocaleDateString("en-CA"));
    setNewContact("");
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
          <div className="flex items-center justify-between">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Nome do paciente <span className="text-[#b65c50]">*</span>
            </span>
            {!isEditable && (
              <button
                type="button"
                onClick={() => {handleChangePatient();}}
                className="mb-2 text-[11px] font-semibold text-[#53665a] underline"
                >
                Trocar paciente
              </button>
            )}
          </div>
          <Autocomplete<PatientRecord>
            value={newName}
            disabled={!isEditable}
            onChange={(value) => {
              setNewName(value);
              setSelectedPatient(null);
            }}
            onSelect={(patient) => handlePatientSelect(patient)}
            fetchSuggestions={fetchPatients}
            getOptionLabel={(patient) => patient.nome}
            getOptionValue={(patient) => patient.id}
            placeholder="Ex.: Ana Carolina Souza"
            minChars={3}
            debounce={300}
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <InputDate
            id="appointment-birthdate-input"
            label="Data de Nascimento"
            required
            disabled={!isEditable}
            value={newBirthDate}
            onChange={(value) => setNewBirthDate(value)}
          />
          <InputSex
            id="appointment-sex-select"
            required
            disabled={!isEditable}
            value={newSex}
            onChange={(value) => setNewSex(value)}
          />
        </div>
        <InputText
          id="appointment-contact-input"
          label="Contato Principal"
          required
          disabled={!isEditable}
          value={newContact}
          onChange={(value) => setNewContact(value)}
          placeholder="Digite o telefone ou e-mail"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputDate
            id="appointment-date-input"
            label="Data"
            required
            value={newDate}
            onChange={(value) => setNewDate(value)}
          />
          <InputTime
            id="appointment-time-input"
            label="Horário"
            required
            value={newTime}
            onChange={(value) => setNewTime(value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputSelect
            id="appointment-duration-select"
            label="Duração"
            required
            value={newDuration}
            onChange={(value) => setNewDuration(value)}
            options={DURATION_APPOINTMENT.map((duration) => ({
              value: duration.toString(),
              label: DURATION_APPOINTMENT_LABELS[duration],
            }))}
          />
          <InputSelect
            id="appointment-type-select"
            label="Atendimento"
            required
            value={newType}
            onChange={(value) => setNewType(value as Atendimento)}
            options={ATENDIMENTOS.map((atendimento) => ({
              value: atendimento,
              label: ATENDIMENTOS_LABELS[atendimento],
            }))}
          />
        </div>
        <InputSelect
          id="appointment-kind-select"
          label="Tipo de consulta"
          required
          value={newKind}
          onChange={(value) => setNewKind(value as TipoConsulta)}
          options={TIPOS_CONSULTA.map((tipoConsulta) => ({
            value: tipoConsulta,
            label: TIPOS_CONSULTA_LABELS[tipoConsulta],
          }))}
        />
        <InputSelect
          id="appointment-location-select"
          label="Local"
          required
          value={newLocation}
          onChange={(value) => setNewLocation(value as Local)}
          options={LOCAIS.map((local) => ({
            value: local,
            label: LOCAIS_LABELS[local],
          }))}
        />
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