import { useState } from "react";
import { toast } from "sonner";
import { Plus, Mail } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { PatientCreateInput, Sex } from "@nutriapp/shared";
import { isDateInFuture } from "../../utils/date";
import { InputCPF, InputDate, InputPhone, InputSex, InputText } from "../ui/input";

export function FormsNewPatient( { onClose, onCreated }: { onClose: () => void; onCreated?: () => void; }) {
  const [newName, setNewName] = useState<string>('');
  const [newCpf, setNewCpf] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newBirthDate, setNewBirthDate] = useState(() => new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [newSex, setNewSex] = useState<Sex>('M');
  const [newContact, setNewContact] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function addPatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim() || loading) return;

    if (isDateInFuture(newBirthDate)) {
      toast.error("A data de nascimento não pode ser no futuro.");
      return;
    }

    const payload: PatientCreateInput = {
      nome: newName.trim(),
      dataNascimento: newBirthDate,
      sexo: newSex,
      contato: newContact.trim(),
      status: "ativo"
    };

    setLoading(true);
    try {
      await apiRequest("/patients", { method: "POST", data: payload });
      toast.success("Paciente cadastrado com sucesso.");
      onCreated?.();
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Não foi possível cadastrar o paciente."
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
      className="my-auto w-full rounded-2xl bg-white p-5 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
            CADASTRO
          </div>
          <h2
            id="new-appointment-title"
            className="text-[20px] font-bold tracking-[-.5px] text-[#20352c]"
          >
            Novo Paciente
          </h2>
        </div>
      </div>
      <form onSubmit={addPatient} className="space-y-4">
        <InputText
          id="patient-name-input"
          label="Nome do Paciente"
          required
          autoFocus
          value={newName}
          onChange={(value) => setNewName(value)}
          placeholder="Ex.: Ana Carolina Souza"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputDate
            id="patient-birthdate-input"
            label="Data de Nascimento"
            required
            value={newBirthDate}
            onChange={(value) => setNewBirthDate(value)}
          />
          <InputSex
            id="patient-sex-select"
            required
            value={newSex}
            onChange={(value) => setNewSex(value)}
          />
        </div>
        <InputCPF
          value={newCpf}
          onChange={(value) => setNewCpf(value)}
        />
        <InputText
          label="Contato Principal"
          id="patient-contact-input"
          helpText="Esse contato será usado para enviar notificações, lembretes e notas fiscais ao paciente."
          required
          value={newContact}
          onChange={(value) => setNewContact(value)}
          placeholder="Repita o e-mail ou o telefone"
          className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              E-mail
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-[#e3eae4] px-3">
              <Mail size={14} className="text-[#98a39b]" />
              <input
                id="patient-email-input"
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="email@exemplo.com"
                className="w-full py-2.5 text-[12px] outline-none"
                />
            </span>
          </label>
          <InputPhone
            id="patient-phone-input"
            value={newPhone}
            onChange={(value) => setNewPhone(value)}
          />
        </div>
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
            {loading ? "Salvando..." : "Salvar paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}