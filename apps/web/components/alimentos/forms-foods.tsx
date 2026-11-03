import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FOOD_CATEGORIES, FoodRecord } from "@nutriapp/shared";
import { apiRequest } from "../../lib/api";
import { InputNumber, InputSelect, InputText } from "../ui/input";

const blankFood = {
  nome: "",
  grupo: FOOD_CATEGORIES[0],
  porcaoReferencia: 100,
  energiaKcal: 0,
  proteinaG: 0,
  carboidratoG: 0,
  lipidiosG: 0,
  fibraG: 0,
  sodioMg: 0
};

const labelsInput = [
  {key:"energiaKcal",label:"Energia (kcal)"},
  {key:"proteinaG",label:"Proteínas (g)"},
  {key:"carboidratoG",label:"Carboidratos (g)"},
  {key:"lipidiosG",label:"Gorduras (g)"},
  {key:"fibraG",label:"Fibras (g)"},
  {key:"sodioMg",label:"Sódio (mg)"},
] as const

type FormsNewFoodProps = {
  data?: FoodRecord;
  onClose: () => void;
  onCreated?: (food: FoodRecord) => void;
};


export function FormsNewFood({ data, onClose, onCreated }: FormsNewFoodProps) {
  const [form, setForm] = useState<Partial<FoodRecord>>(blankFood);
  const isEditing = data !== null && data !== undefined;

  useEffect(() => {
    if (!data) {
      setForm(blankFood);
      return;
    }

    setForm({
      nome: data.nome,
      grupo: data.grupo ?? FOOD_CATEGORIES[0],
      porcaoReferencia: data.porcaoReferencia,
      energiaKcal: data.energiaKcal,
      proteinaG: data.proteinaG,
      carboidratoG: data.carboidratoG,
      lipidiosG: data.lipidiosG,
      fibraG: data.fibraG,
      sodioMg: data.sodioMg,
    });
  }, [data]);

  async function saveFood(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.nome === undefined) {
      toast.error("Informe o nome do alimento.");
      return;
    }

    const food: FoodRecord = {
      nome: form.nome.trim(),
      grupo: form.grupo as string,
      porcaoReferencia: Number(form.porcaoReferencia) || 100,
      energiaKcal: Number(form.energiaKcal) || 0,
      proteinaG: Number(form.proteinaG) || 0,
      carboidratoG: Number(form.carboidratoG) || 0,
      lipidiosG: Number(form.lipidiosG) || 0,
      fibraG: Number(form.fibraG) || 0,
      sodioMg: Number(form.sodioMg) || 0,
      idExterno: isEditing ? data?.idExterno! : null,
      fonte: isEditing ? data?.fonte! : "manual",
      criadoEm: isEditing ? data?.criadoEm! : new Date(),
      nomeBusca: form.nome.trim().toLowerCase(),
      id: isEditing ? data?.id! : "",
      outros: isEditing ? data?.outros! : {},
      atualizadoEm: new Date(),
    };

    if (isEditing) {
      try {
        const response = await apiRequest<{ alimento?: FoodRecord }>(`/foods/${food.id}`, { method: "PATCH", data: food });

        onCreated?.(response.alimento!);
        toast.success("Alimento atualizado com sucesso.");
        onClose();
        return;
      } catch (error) {
        toast.error("Erro ao atualizar alimento.");
      }
    }

    if (!isEditing) {
      try {
        const response = await apiRequest<{alimento?: FoodRecord}>("/foods", { method: "POST", data: food });

        onCreated?.(response.alimento!);
        toast.success("Alimento cadastrado com sucesso.");
        onClose();
        return;
      } catch (error) {
        toast.error("Erro ao salvar alimento.");
      }
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="my-auto w-full max-w-[560px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
            BIBLIOTECA NUTRICIONAL
          </div>
          <h2 className="text-[20px] font-bold text-[#20352c]">
            {isEditing ? "Editar alimento" : "Adicionar alimento"}
          </h2>
          <p className="mt-1 text-[11px] text-[#87948b]">Informe os valores para a porção de referência indicada.</p>
        </div>
      </div>
      <form
        onSubmit={saveFood}
        className="space-y-4"
      >
        <InputText
          label="Nome do alimento"
          required
          autoFocus
          value={form.nome}
          onChange={(value) => setForm({...form, nome:value})}
          placeholder="Ex.: Batata-doce cozida"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputSelect
            label="Categoria"
            value={form.grupo}
            onChange={(value) => setForm({...form, grupo:value})}
            options={FOOD_CATEGORIES.map(c => ({ value: c, label: c }))}
          />
          <InputNumber
            label="Porção de referência"
            value={form.porcaoReferencia ?? 100}
            onChange={(value) => setForm({...form, porcaoReferencia:(value)})}
            placeholder="100"
            step={1}
            unit="g"
          />
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold text-[#53665a]">
            Informações nutricionais
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(labelsInput).map(item=>
              <label key={item.key} className="block">
                <span className="mb-1.5 block text-[10px] text-[#87948b]">
                  {item.label}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[item.key]}
                  onChange={e=>setForm({...form,[item.key]:e.target.value})}
                  className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={()=> onClose()}>
              Cancelar
          </button>
          <button type="submit" className="btn-primary">
            <Check size={14}/>{isEditing ? "Salvar alterações" : "Salvar alimento"}
          </button>
        </div>
      </form>
    </div>
  )
}