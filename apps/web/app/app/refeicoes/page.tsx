'use client';

import {
  Check,
  CircleAlert,
  Flame,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  Utensils,
  Layers3,
  Calculator,
  Copy,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModalStore } from '../../../stores/modal-store';
import { useHeaderStore } from '../../../stores/header-store';
import { ShortcutLabel } from '../../../components/ui/label';
import { toast } from 'sonner';
import { apiRequest } from '../../../lib/api';
import { useKeyboardShortcut } from '../../../hooks/use-keyboard-shortcut';
import { FormsNewMeal } from '../../../components/refeicoes/forms-meals';
import { MealPage, MealRecord, TYPE_MEAL, TYPE_MEAL_LABELS } from '@nutriapp/shared';
import { convertDateFromApi } from '../../../utils/date';
import { TablePagination } from '../../../components/ui/table/table-pagination';
import { ModalDelete } from '../../../components/ui/modal';


export default function MealsPage() {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos os tipos');
  const [notice, setNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0 });

  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    setConfig({
      title: "Refeições",
      subtitle: "Biblioteca nutricional",
      actions: (
        <button
          className="btn-primary"
          onClick={() => openModal(
            <FormsNewMeal
              onClose={() => { closeModal(); }}
              onCreated={(newMeal) => {

                // os nutrientes das refeições compostas vem do backend
                if (newMeal.tipo === TYPE_MEAL.COMPOSED) {
                  return loadMeals(1);
                }

                setMeals(current => [newMeal, ...current]);
              }}
            />,
            "default",
          )}
        >
          <Plus size={15} />
          Nova Refeição
          <ShortcutLabel label="Ctrl N" />
        </button>
      )
    });

    return reset;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConfig, reset]);

  const handleOpenShortcuts = useCallback(() => {
      openModal(<FormsNewMeal onClose={() => { closeModal(); }} />);
    }, [openModal, closeModal]);

  useKeyboardShortcut("n", handleOpenShortcuts);

  useEffect(() => {
    setLoading(true);
    apiRequest<{ refeicoes: MealPage }>("/meals").then((response) => {
      setPagination({ page: response.refeicoes.page, pageSize: response.refeicoes.pageSize, totalItems: response.refeicoes.total });
      setMeals(response.refeicoes.items);
    }).catch((reason) => {
      toast.error(reason instanceof Error ? reason.message : "Erro ao buscar dados.");
    }).finally(() => {
      setLoading(false);
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      meals
        .filter((m) =>
          m.nome
            .toLocaleLowerCase('pt-BR')
            .includes(query.toLocaleLowerCase('pt-BR')),
        )
        .filter((m) => typeFilter === 'Todos os tipos' || m.tipo === typeFilter)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [meals, query, typeFilter],
  );


  function openEdit(meal: MealRecord) {
    alert("ediçao")
  }

  async function removeMeal(meal: MealRecord) {
    const response = await apiRequest<{ status: string }>(`/meals/${meal.id}`, { method: "DELETE" });

    if (!response.status || response.status !== "ok") {
      return toast.error("Erro ao remover refeição.");
    }

    setMeals((current) => current.filter((m) => m.id !== meal.id));
    closeModal();
    toast.success(`Refeição ${meal.nome} removida com sucesso.`);
  }

  async function loadMeals(page: number) {
    const response = await apiRequest<{ refeicoes: MealPage }>(
      `/meals?page=${page}&pageSize=${pagination.pageSize}`
    );

    setMeals(response.refeicoes.items);

    setPagination({
      page: response.refeicoes.page,
      pageSize: response.refeicoes.pageSize,
      totalItems: response.refeicoes.total,
    });
  }

  function ModalMealDetail({ meal, onClosed }: {meal: MealRecord, onClosed: () => void}) {
    return (
      <div className="w-full min-w-[400px] px-4">
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`pill ${meal.tipo === 'composta' ? 'bg-[#edf2fa] text-[#5576a3]' : 'bg-[#e9f5ed] text-[#287653]'}`}
            >
              {meal.tipo}
            </span>
            <h2 className="mt-3 text-[18px] font-bold text-[#20352c]">
              {meal.nome}
            </h2>
            <p className="mt-1 text-[11px] text-[#87948b]">
              {meal.descricao}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: 'Energia',
              value: `${Math.round(meal.energiaKcal ?? 0)} kcal`,
            },
            {
              label: 'Proteínas',
              value: `${meal.proteinaG?.toFixed(1) || '0.0'} g`,
            },
            {
              label: 'Carboidratos',
              value: `${meal.carboidratoG?.toFixed(1) || '0.0'} g`,
            },
            {
              label: 'Gorduras',
              value: `${meal.lipidiosG?.toFixed(1) || '0.0'} g`
            },
            {
              label: 'Fibras',
              value: `${meal.fibraG?.toFixed(1) || '0.0'} g`
            },
            {
              label: 'Sódio',
              value: `${meal.sodioMg?.toFixed(1) || '0.0'} Mg`
            },
          ].map((n) => (
            <div key={n.label} className="rounded-xl bg-[#f6f9f6] p-3">
              <div className="text-[10px] text-[#87948b]">{n.label}</div>
              <div className="mt-1 text-[13px] font-bold text-[#304638]">
                {n.value}
              </div>
            </div>
          ))}
        </div>
        {meal.tipo === 'composta' && (
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-bold text-[#304638]">
              Ingredientes
            </h3>
            {meal.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-[#edf1ed] py-2 text-[11px] text-[#53665a]"
              >
                <span>{item.nome}</span>
                <span>{item.gramas} g</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="btn-secondary"
            onClick={onClosed}
          >
            Fechar
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              openEdit(meal);
            }}
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="main">
        <div className="content">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
                COMPOSIÇÕES E RECEITAS
              </div>
              <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
                Refeições cadastradas
              </h1>
              <p className="mt-1 max-w-[650px] text-[12px] leading-5 text-[#7d8b83]">
                Monte combinações com alimentos da biblioteca ou registre
                preparações com seus valores por porção.
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ece5] bg-[#f5f9f5] px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#355743]">
                <Calculator size={15} />
                Cálculo nutricional automático
              </div>
              <div className="mt-1 text-[10px] text-[#87948b]">
                Refeições compostas somam os ingredientes
              </div>
            </div>
          </div>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                <Utensils size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Refeições cadastradas
                </div>
                <div className="mt-1 text-[24px] font-bold">{meals.length}</div>
              </div>
            </div>
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2fa] text-[#5576a3]">
                <Layers3 size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">Compostas</div>
                <div className="mt-1 text-[24px] font-bold">
                  {meals.filter((m) => m.tipo === TYPE_MEAL.COMPOSED).length}
                </div>
              </div>
            </div>
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">Preparadas</div>
                <div className="mt-1 text-[24px] font-bold">
                  {meals.filter((m) => m.tipo === TYPE_MEAL.PREPARED).length}
                </div>
              </div>
            </div>
          </div>
          <section className="panel overflow-hidden">
            <div className="border-b border-[#edf1ed] p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="section-title">Sua biblioteca de refeições</h2>
                  <p className="section-subtitle">
                    Valores nutricionais por porção · {filtered.length}{' '}
                    resultados
                  </p>
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2.5 text-[#98a39b] sm:w-[280px]">
                  <Search size={15} />
                  <input
                    aria-label="Buscar refeição"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar refeição..."
                    className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#9ba69e]"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#78877e]">
                  <SlidersHorizontal size={13} />
                  Filtrar:
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a]"
                >
                  <option value="Todos os tipos">Todos os tipos</option>
                  <option value={TYPE_MEAL.PREPARED}>{TYPE_MEAL_LABELS[TYPE_MEAL.PREPARED]}</option>
                  <option value={TYPE_MEAL.COMPOSED}>{TYPE_MEAL_LABELS[TYPE_MEAL.COMPOSED]}</option>
                </select>
                {(query ||
                  typeFilter !== 'Todos os tipos') && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setTypeFilter('Todos os tipos');
                    }}
                    className="text-[11px] font-semibold text-[#287653]"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[930px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#fafcf9] text-[10px] font-semibold uppercase tracking-[.65px] text-[#87948b]">
                    <th className="px-5 py-3">Refeição</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Energia</th>
                    <th className="px-4 py-3">Fibras</th>
                    <th className="px-4 py-3">Proteínas</th>
                    <th className="px-4 py-3">Carboidratos</th>
                    <th className="px-4 py-3">Gorduras</th>
                    <th className="px-4 py-3">Atualizada</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f0]">
                  {filtered.map((m) => (
                    <tr key={m.id} className="group hover:bg-[#fbfdfb]">
                      <td className="px-5 py-3.5">
                        <button
                          className="text-left"
                          onClick={() => openModal(
                            <ModalMealDetail meal={m} onClosed={() => { closeModal(); }}/>,
                            'default'
                          )}
                        >
                          <span className="block text-[12px] font-semibold text-[#304638] group-hover:text-[#287653]">
                            {m.nome}
                          </span>
                          <span className="mt-1 block max-w-[250px] truncate text-[10px] text-[#8a978f]">
                            {m.descricao ||
                              `${m.items.length} ingredientes`}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`pill ${m.tipo === TYPE_MEAL.COMPOSED ? 'bg-[#edf2fa] text-[#5576a3]' : 'bg-[#e9f5ed] text-[#287653]'}`}
                        >
                          {TYPE_MEAL_LABELS[m.tipo]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] font-semibold text-[#304638]">
                        {(m?.energiaKcal?.toFixed(2))} kcal
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m?.fibraG?.toFixed(2)} g
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m?.proteinaG?.toFixed(2)} g
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m?.carboidratoG} g
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m?.lipidiosG?.toFixed(2)} g
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#718278]">
                        {convertDateFromApi(m.atualizadoEm)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button
                            aria-label={`Editar ${m.nome}`}
                            onClick={() => openEdit(m)}
                            className="rounded-lg p-2 text-[#819087] hover:bg-white hover:text-[#287653]"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            aria-label={`Duplicar ${m.nome}`}
                            onClick={() => {
                              setMeals((current) => [
                                {
                                  ...m,
                                  nome: `${m.nome} (cópia)`,
                                  updated: new Date(),
                                },
                                ...current,
                              ]);
                              setNotice('Cópia criada nesta demonstração.');
                            }}
                            className="rounded-lg p-2 text-[#819087] hover:bg-white hover:text-[#287653]"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            aria-label={`Remover ${m.nome}`}
                            onClick={() => openModal(
                              <ModalDelete
                                title="Remover Refeição"
                                description={`Tem certeza que deseja remover "${m.nome}"?`}
                                onConfirm={() => removeMeal(m)}
                                onCancel={() => closeModal()}
                              />
                            )}
                            className="rounded-lg p-2 text-[#a0aaa2] hover:bg-white hover:text-[#b65c50]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Search size={22} className="mx-auto mb-3 text-[#8e9c92]" />
                  <p className="text-[13px] font-semibold text-[#304638]">
                    Nenhuma refeição encontrada
                  </p>
                  <p className="mt-1 text-[11px] text-[#87948b]">
                    Ajuste a busca ou crie uma nova refeição.
                  </p>
                  <button
                    onClick={() => openModal(
                      <FormsNewMeal
                        onClose={() => { closeModal(); }}
                        onCreated={(newMeal) => {
                          if (newMeal.tipo === TYPE_MEAL.COMPOSED) {
                            return loadMeals(1);
                          }
                          setMeals(current => [newMeal, ...current]);
                        }}
                      />,
                      "default",
                    )}
                    className="mt-3 text-[11px] font-semibold text-[#287653]"
                  >
                    Criar refeição
                  </button>
                </div>
              )}
            </div>
            <TablePagination pagination={pagination} onPageChange={loadMeals} />
          </section>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#e5ece5] bg-[#f7faf7] p-4">
            <CircleAlert size={16} className="mt-0.5 shrink-0 text-[#7b9882]" />
            <div>
              <p className="text-[11px] font-semibold text-[#355743]">
                Receitas preparadas e compostas
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#7d8b83]">
                Preparadas: receitas como bolos e tortas, com os valores por
                porção informados no cadastro. Compostas: seleções de alimentos
                em que calorias e macronutrientes são calculados com a soma dos alimentos.
              </p>
            </div>
          </div>

        </div>
      </main>
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-[12px] text-[#355743] shadow-lg"
        >
          <Check size={15} />
          {notice}
          <button onClick={() => setNotice('')}>
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
