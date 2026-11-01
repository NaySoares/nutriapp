import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FOOD_CATEGORIES, FoodRecord } from "@nutriapp/shared";
import { apiRequest } from "../../lib/api";

const blankFood = {
  name: "",
  category: FOOD_CATEGORIES[0],
  portion: "100 g",
  kcal: "0",
  protein: "0",
  carbs: "0",
  fat: "0",
  fiber: "0",
  sodium: "0"
};

const labelsInput = [
  {key:"kcal",label:"Energia (kcal)"},
  {key:"protein",label:"Proteínas (g)"},
  {key:"carbs",label:"Carboidratos (g)"},
  {key:"fat",label:"Gorduras (g)"},
  {key:"fiber",label:"Fibras (g)"},
  {key:"sodium",label:"Sódio (mg)"},
] as const

type FormsNewFoodProps = {
  data?: FoodRecord;
  onClose: () => void;
  onCreated?: (food: FoodRecord) => void;
};


export function FormsNewFood({ data, onClose, onCreated }: FormsNewFoodProps) {
  const [form, setForm] = useState<Record<string, string>>(blankFood);
  const isEditing = data !== null && data !== undefined;

  useEffect(() => {
    if (!data) {
      setForm(blankFood);
      return;
    }

    setForm({
      name: data.nome,
      category: data.grupo ?? FOOD_CATEGORIES[0],
      portion: "100 g",
      kcal: String(data.energiaKcal),
      protein: String(data.proteinaG),
      carbs: String(data.carboidratoG),
      fat: String(data.lipidiosG),
      fiber: String(data.fibraG),
      sodium: String(data.sodioMg),
    });
  }, [data]);

  async function saveFood(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.name === undefined) {
      toast.error("Informe o nome do alimento.");
      return;
    }

    const food: FoodRecord = {
      nome: form.name.trim(),
      grupo: form.category as string,
      // portion: form.portion.trim() || "100 g",
      energiaKcal: Number(form.kcal) || 0,
      proteinaG: Number(form.protein) || 0,
      carboidratoG: Number(form.carbs) || 0,
      lipidiosG: Number(form.fat) || 0,
      fibraG: Number(form.fiber) || 0,
      sodioMg: Number(form.sodium) || 0,
      idExterno: isEditing ? data?.idExterno! : null,
      fonte: isEditing ? data?.fonte! : "manual",
      criadoEm: isEditing ? data?.criadoEm! : new Date(),
      nomeBusca: form.name.trim().toLowerCase(),
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
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
            Nome do alimento
          </span>
          <input
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({...form, name:e.target.value})}
            placeholder="Ex.: Batata-doce cozida"
            className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Categoria
            </span>
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category:e.target.value})}
              className="w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px]"
            >
              {FOOD_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
              Porção de referência
            </span>
            <input
              value={form.portion}
              onChange={e=>setForm({...form,portion:e.target.value})}
              placeholder="100 g"
              className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none"
            />
          </label>
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