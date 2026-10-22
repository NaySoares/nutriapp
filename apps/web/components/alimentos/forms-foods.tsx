import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Food = {
  id: number;
  name: string;
  category: string;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: "Manual" | "Importação CSV" | "API";
  updated: string;
};

const blankFood = { name: "", category: "Frutas", portion: "100 g", kcal: "0", protein: "0", carbs: "0", fat: "0", fiber: "0" };
const categories = ["Frutas", "Verduras e legumes", "Cereais e derivados", "Leguminosas", "Carnes e ovos", "Leites e derivados", "Óleos e gorduras", "Outros"];

export function FormsNewFood({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void; }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState(blankFood);

  function saveFood(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const food: Food = {
      id: editing?.id ?? Date.now(),
      name: form.name.trim(),
      category: form.category,
      portion: form.portion.trim() || "100 g",
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      fiber: Number(form.fiber) || 0,
      source: editing?.source ?? "Manual",
      updated: "Hoje"
    };

    setFoods(current => editing ? current.map(f => f.id === editing.id ? food : f) : [food, ...current]); setModal(false); toast.success(editing ? "Alimento atualizado com sucesso." : "Alimento cadastrado com sucesso.");
  }

  return (
    <div role="dialog" aria-modal="true" className="my-auto w-full max-w-[560px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
            BIBLIOTECA NUTRICIONAL
          </div>
          <h2 className="text-[20px] font-bold text-[#20352c]">
            {editing?"Editar alimento":"Adicionar alimento"}
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
            onChange={e=>setForm({...form,name:e.target.value})}
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
              onChange={e=>setForm({...form,category:e.target.value})}
              className="w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px]"
            >
              {categories.map(c=><option key={c}>{c}</option>)}
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
            {([{key:"kcal",label:"Energia (kcal)"},{key:"protein",label:"Proteínas (g)"},{key:"carbs",label:"Carboidratos (g)"},{key:"fat",label:"Gorduras (g)"},{key:"fiber",label:"Fibras (g)"}] as const).map(item=>
              <label key={item.key} className="block">
                <span className="mb-1.5 block text-[10px] text-[#87948b]">
                  {item.label}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
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
            <Check size={14}/>{editing?"Salvar alterações":"Salvar alimento"}
          </button>
        </div>
      </form>
    </div>
  )
}