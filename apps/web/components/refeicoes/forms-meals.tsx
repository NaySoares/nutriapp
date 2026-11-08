import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { apiRequest } from "../../lib/api";
import { Layers3, X, Utensils, Check, Plus, Calculator } from "lucide-react";
import { MealRecord, TypeMeal, TYPE_MEAL, MealUpdate, MealCreate, FoodRecord, ItemsMealRecord } from "@nutriapp/shared";
import { InputNumber, InputText, LabelInput } from "../ui/input";
import { useModalStore } from "../../stores/modal-store";
import { Autocomplete } from "../ui/autocomplete";
import { FoodPage } from "../../../../packages/shared/dist/types/food";
import { Button } from "../ui/button";

const NUTRIENTS_VALUES = [
  { key: 'energiaKcal', label: 'Energia (kcal)' },
  { key: 'proteinaG', label: 'Proteínas (g)' },
  { key: 'carboidratoG', label: 'Carboidratos (g)' },
  { key: 'lipidiosG', label: 'Gorduras (g)' },
  { key: 'fibraG', label: 'Fibras (g)' },
  { key: 'sodioMg', label: 'Sódio (mg)' },
] as const

type FormsNewMealProps = {
  data?: MealRecord;
  onClose: () => void;
  onCreated?: (meal: MealRecord) => void;
};

const formBlank: Partial<MealCreate | MealUpdate> = {
  nome: '',
  descricao: '',
  tipo: TYPE_MEAL.COMPOSED,
  porcaoGramas: 100,
  energiaKcal: 0,
  proteinaG: 0,
  lipidiosG: 0,
  carboidratoG: 0,
  fibraG: 0,
  sodioMg: 0,
};

export function FormsNewMeal({data, onClose, onCreated }: FormsNewMealProps) {

  const [form, setForm] = useState<Partial<MealCreate | MealUpdate>>(formBlank);
  const [type, setType] = useState<TypeMeal>(TYPE_MEAL.COMPOSED);
  const [items, setItems] = useState<FoodRecord[]>([]);
  const [totals, setTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0, fibers: 0, sodio: 0});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    if (type === TYPE_MEAL.COMPOSED) {
      const newTotals = items.reduce((acc, item) => {
        if (item.porcaoReferencia) {
          const factor = item.porcaoReferencia / 100;
          acc.kcal += item.energiaKcal * factor;
          acc.protein += item.proteinaG * factor;
          acc.carbs += item.carboidratoG * factor;
          acc.fat += item.lipidiosG * factor;
          acc.fibers += item.fibraG * factor;
          acc.sodio += item.sodioMg * factor;
        }
        return acc;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, fibers: 0, sodio: 0 });
      setTotals(newTotals);
    }
  }, [items, type]);

  const fetchFoods = useCallback(
    async (query: string, signal: AbortSignal) => {
      const response = await apiRequest<FoodPage>(
        `/foods?q=${encodeURIComponent(query)}&page=1&pageSize=10`,
        { signal }
      );

      return response.alimentos.items;
    },
    []
  );

  const FoodSearchModal = ({ onAdd }: { onAdd: (food: FoodRecord) => void }) => {
    const closeModal = useModalStore((state) => state.closeModal);
    const [food, setFood] = useState<string>('');
    const [selectedFood, setSelectedFood] = useState<FoodRecord | null>(null);

    return (
      <div className="flex flex-col gap-2 relative w-full h-full rounded-xl bg-white">
        <LabelInput label="Buscar alimentos">
          <Autocomplete<FoodRecord>
            value={food}
            onChange={setFood}
            onSelect={setSelectedFood}
            fetchSuggestions={fetchFoods}
            getOptionLabel={(food) => food.nome}
            getOptionValue={(food) => food.id}
            placeholder="Ex.: Abacaxi"
            minChars={3}
            debounce={300}
            required
          />
        </LabelInput>

        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} variant="secondary">
            Cancelar
          </Button>
          <button
            type="button"
            onClick={() => {
              if (!selectedFood) {
                toast.error("Selecione um alimento antes de adicionar.");
                return;
              }

              onAdd(selectedFood);
              closeModal();
            }}
            className="btn-primary"
          >
            Adicionar
          </button>
        </div>
      </div>
    )
  };

  const updateItems = (id: string, data: Partial<FoodRecord>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  function createItemPayload (foods: FoodRecord[]): Partial<ItemsMealRecord>[] {
    return foods.map((food, index) => ({
      alimentoId: food.id,
      gramas: food.porcaoReferencia ?? 0,
      nome: food.nome,
      medidaId: food.medidaId ?? null,
      quantidadeMedida: null,
      ordem: index + 1,
    }))
  };

  const saveMeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;


    const payload = {
      ...form,
      tipo: type,
      itens: type === TYPE_MEAL.COMPOSED ? createItemPayload(items) : undefined,
    }
    console.log('saving meal with payload:', payload);

    setLoading(true);
    try {
      const response = await apiRequest<{ refeicoes?: MealRecord }>('/meals', { method: 'POST', data: payload });

      onCreated?.(response.refeicoes!);
      toast.success('Refeição criada com sucesso.');
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : 'Não foi possível criar a refeição.'
      );
    } finally {
      setLoading(false);
    }
  };

  function FieldsForComposedMeal() {
    return (
      <div className="rounded-xl border border-[#e7eee8] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[12px] font-bold text-[#304638]">
              Alimentos e quantidades
            </h3>
            <p className="mt-1 text-[10px] text-[#87948b]">
              Informe a quantidade em gramas para cada ingrediente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal(
              <FoodSearchModal
                onAdd={(food) => {
                  if (items.some((item) => item.id === food.id)) {
                    toast.error("Este alimento já foi adicionado.");
                    return;
                  }
                  setItems((current) => [...current, food]);
                }}
              />,
              'default',
              {
                title: "Busca de alimentos",
                width: "600px",
              }
            )}
            className="btn-secondary"
          >
            <Plus size={13} />
            Adicionar item
          </button>
        </div>
        <div className="space-y-2 border-t border-[#edf1ed] pt-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,1fr)_100px_32px] items-center gap-2"
            >
              <div className="flex flex-col">
                <div className="text-[11px] font-bold text-[#304638]">
                  {item.nome}
                </div>
                <div className="text-[10px] text-[#87948b]">
                  {item.grupo}
                </div>
              </div>
              <label className="flex items-center gap-1 rounded-lg border border-[#e3eae4] px-2">
                <input
                  aria-label="Quantidade em gramas"
                  type="number"
                  min="1"
                  step="1"
                  value={item.porcaoReferencia ?? 0}
                  onChange={(e) =>
                    updateItems(item.id, { porcaoReferencia: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 text-[11px] outline-none"
                />
                <span className="text-[10px] text-[#87948b]">g</span>
              </label>
              <button
                type="button"
                aria-label="Remover ingrediente"
                disabled={items.length === 1}
                onClick={() =>
                  setItems((current) =>
                    current.filter((_, i) => i !== index),
                  )
                }
                className="grid h-8 w-8 place-items-center rounded-lg text-[#9aa59d] hover:bg-[#fff2ef] hover:text-[#b65c50] disabled:opacity-30"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-[#f3f8f3] p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#355743]">
            <Calculator size={14} />
            Total nutricional calculado
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Energia',
                value: `${Math.round(totals.kcal)} kcal`,
              },
              {
                label: 'Proteínas',
                value: `${totals.protein.toFixed(1)} g`,
              },
              {
                label: 'Carboidratos',
                value: `${totals.carbs.toFixed(1)} g`,
              },
              {
                label: 'Gorduras',
                value: `${totals.fat.toFixed(1)} g`,
              },
              {
                label: 'Fibras',
                value: `${totals.fibers.toFixed(1)} g`,
              },
              {
                label: 'Sódio',
                value: `${totals.sodio.toFixed(1)} g`,
              },
            ].map((n) => (
              <div key={n.label}>
                <div className="text-[10px] text-[#87948b]">
                  {n.label}
                </div>
                <div className="mt-1 text-[13px] font-bold text-[#304638]">
                  {n.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function FieldsForPreparedMeal() {
    return (
      <div className="rounded-xl border border-[#e7eee8] p-4">
        <h3 className="mb-1 text-[12px] font-bold text-[#304638]">
          Valores nutricionais por porção
        </h3>
        <p className="mb-3 text-[10px] text-[#87948b]">
          Para preparações, informe os valores calculados da receita
          por porção.
        </p>
        <div className="mb-4">
          <label className="mt-3 block">
            <span className="mb-1.5 block text-[10px] text-[#87948b]">
              Gramas da porção (porção é a quantidade que será usada para calcular os macros)
            </span>
            <div className="sm:max-w-[130px]">
              <InputNumber
                min="1"
                step={1}
                value={form.porcaoGramas ?? 100}
                onChange={(value) =>
                  setForm({ ...form, porcaoGramas: Number(value) })
                }
                unit="g"
              />
            </div>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(NUTRIENTS_VALUES).map((n) => (
            <label key={n.key}>
              <span className="mb-1.5 block text-[10px] text-[#87948b]">
                {n.label}
              </span>
              <InputNumber
                min="0"
                step={0.01}
                value={form[n.key] ?? 0}
                onChange={(value) =>
                  setForm({ ...form, [n.key]: Number(value) })
                }
                unit={n.key === 'energiaKcal' ? 'kcal' : 'g'}
              />
            </label>
          ))}
        </div>
      </div>
    )
  }


  return (
    <div
      role="dialog"
      aria-modal="true"
      className="my-auto w-full max-w-[680px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
            BIBLIOTECA DE REFEIÇÕES
          </div>
          <h2 className="text-[20px] font-bold text-[#20352c]">
            {editing ? 'Editar refeição' : 'Nova refeição'}
          </h2>
          <p className="mt-1 text-[11px] text-[#87948b]">
            Escolha o tipo para definir como os valores nutricionais serão
            calculados.
          </p>
        </div>
      </div>
      <form onSubmit={saveMeal} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setType(TYPE_MEAL.COMPOSED)}
            className={`rounded-xl border p-3 text-left ${type === TYPE_MEAL.COMPOSED ? 'border-[#8ab69a] bg-[#f2f8f3]' : 'border-[#e6ece7]'}`}
          >
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#304638]">
              <Layers3 size={16} className="text-[#287653]" />
              Refeição composta
            </div>
            <p className="mt-1 text-[10px] leading-4 text-[#87948b]">
              Selecione alimentos. Os macros são somados automaticamente.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setType(TYPE_MEAL.PREPARED)}
            className={`rounded-xl border p-3 text-left ${type === TYPE_MEAL.PREPARED ? 'border-[#8ab69a] bg-[#f2f8f3]' : 'border-[#e6ece7]'}`}
          >
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#304638]">
              <Utensils size={16} className="text-[#287653]" />
              Preparação pronta
            </div>
            <p className="mt-1 text-[10px] leading-4 text-[#87948b]">
              Cadastre receita como bolo, torta ou salada com valores por
              porção.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InputText
            label="Nome da refeição"
            required
            value={form.nome}
            onChange={(value) => setForm({ ...form, nome: value })}
            placeholder={type === TYPE_MEAL.COMPOSED ? 'Ex: Salada de frango com grão-de-bico' : 'Ex: Bolo de cenoura'}
            className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
            Descrição / preparo (opcional)
          </span>
          <textarea
            rows={2}
            value={form.descricao ?? ''}
            onChange={(e) =>
              setForm({ ...form, descricao: e.target.value })
            }
            placeholder="Observações para uso futuro nos planos alimentares"
            className="w-full resize-y rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
          />
        </label>

        {type === TYPE_MEAL.COMPOSED ? (
          <FieldsForComposedMeal />
        ) : (
          <FieldsForPreparedMeal />
        )}

        <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            <Check size={14} />
            {editing ? 'Salvar alterações' : 'Criar refeição'}
          </button>
        </div>
      </form>
    </div>
  )
}