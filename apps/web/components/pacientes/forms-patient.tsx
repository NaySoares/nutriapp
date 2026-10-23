import { useState } from "react";
import { toast } from "sonner";
import { Plus, Phone, Mail } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { PatientCreateInput, Sex } from "@nutriapp/shared";
import { isDateInFuture } from "../../utils/date";
import { Tooltip } from "../ui/tooltip";

export function FormsNewPatient( { onClose, onCreated }: { onClose: () => void; onCreated?: () => void; }) {
  const [newName, setNewName] = useState<string>('');
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
      contato: newContact?.trim() || undefined,
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
      className="my-auto w-full max-w-[520px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
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
            placeholder="Ex.: Ana Carolina Souza"
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
           <Tooltip content="Opção desabilitada no momento, use o campo 'contato'">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                E-mail
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-[#e3eae4] px-3">
                <Mail size={14} className="text-[#98a39b]" />
                <input
                  id="patient-email-input"
                  disabled={true}
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full py-2.5 text-[12px] outline-none hover:cursor-not-allowed"
                  />
              </span>
            </label>
          </Tooltip>
          <Tooltip content="Opção desabilitada no momento, use o campo 'contato'">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                Telefone
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-[#e3eae4] px-3">
                <Phone size={14} className="text-[#98a39b]" />
                <input
                  id="patient-phone-input"
                  disabled={true}
                  value={newPhone}
                  onChange={(event) => setNewPhone(event.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full py-2.5 text-[12px] outline-none hover:cursor-not-allowed"
                  />
              </span>
            </label>
          </Tooltip>
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