"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Pencil, Plus, Search, Trash2, X, Database } from "lucide-react";
import { useHeaderStore } from "../../../stores/header-store";
import { useModalStore } from "../../../stores/modal-store";
import { toast } from "sonner";
import { FormsNewFood } from "../../../components/alimentos/forms-foods";
import { ModalDelete } from "../../../components/ui/modal";
import { apiRequest } from "../../../lib/api";
import { FoodRecord } from "@nutriapp/shared";
import { FoodPage } from "../../../../../packages/shared/dist/types/food";
import { convertDateFromApi } from "../../../utils/date";

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

const seedFoods: Food[] = [
  { id: 1, name: "Aveia em flocos", category: "Cereais e derivados", portion: "100 g", kcal: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1, source: "API", updated: "19 out, 2026" },
  { id: 2, name: "Banana-prata", category: "Frutas", portion: "100 g", kcal: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2, source: "API", updated: "19 out, 2026" },
  { id: 3, name: "Peito de frango grelhado", category: "Carnes e ovos", portion: "100 g", kcal: 159, protein: 32, carbs: 0, fat: 2.5, fiber: 0, source: "Importação CSV", updated: "17 out, 2026" },
  { id: 4, name: "Arroz integral cozido", category: "Cereais e derivados", portion: "100 g", kcal: 124, protein: 2.6, carbs: 25.8, fat: 1, fiber: 2.7, source: "Manual", updated: "16 out, 2026" },
  { id: 5, name: "Ovo de galinha cozido", category: "Carnes e ovos", portion: "1 unidade (50 g)", kcal: 77, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, source: "API", updated: "15 out, 2026" },
  { id: 6, name: "Iogurte natural", category: "Leites e derivados", portion: "170 g", kcal: 104, protein: 6, carbs: 8, fat: 5, fiber: 0, source: "Manual", updated: "14 out, 2026" },
  { id: 7, name: "Abacate", category: "Frutas", portion: "100 g", kcal: 96, protein: 1.2, carbs: 6, fat: 8.4, fiber: 6.3, source: "API", updated: "12 out, 2026" },
  { id: 8, name: "Feijão carioca cozido", category: "Leguminosas", portion: "100 g", kcal: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5, source: "Importação CSV", updated: "10 out, 2026" },
];

const categories = ["Frutas", "Verduras e legumes", "Cereais e derivados", "Leguminosas", "Carnes e ovos", "Leites e derivados", "Óleos e gorduras", "Outros"];

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, totalItems: 0 });
  const [category, setCategory] = useState("Todas as categorias");
  const [source, setSource] = useState("Todas as origens");
  const [loading, setLoading] = useState(false);

  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    setConfig({
      title: "Alimentos",
      subtitle: 'Biblioteca nutricional',
      actions: (
        <button
          className="btn-primary"
          onClick={() => openModal(<FormsNewFood onClose={() => { closeModal(); }} />)}
        >
          <Plus size={15} />
          Adicionar alimento
        </button>
      )
    });

    return reset;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConfig, reset]);

  useEffect(() => {
      setLoading(true);
      apiRequest<FoodPage>("/foods").then((response) => {
        setPagination({ page: response.alimentos.page, pageSize: response.alimentos.pageSize, totalItems: response.alimentos.total });
        setFoods(response.alimentos.items);
      }).catch((reason) => {
        toast.error(reason instanceof Error ? reason.message : "Erro ao buscar dados.");
      }).finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const filtered = useMemo(() => {
    return (
      foods.filter(f => f.nome.toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")))
        .filter(f => category === "Todas as categorias" || f.grupo === category)
        .filter(f => source === "Todas as origens" || f.fonte === source)
        .sort((a,b) => a.nome.localeCompare(b.nome,"pt-BR"))
    );
  }, [foods, query, category, source]);

  function removeFood(food: FoodRecord) {
    setFoods(current => current.filter(f => f.id !== food.id));
    closeModal();
    toast.success(`Alimento ${food.nome} removido com sucesso.`);
  }

  return (
  <div className="min-h-screen">
    <main className="main">
    <div className="content">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
            BASE DE DADOS
          </div>
          <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
            Biblioteca de alimentos
          </h1>
          <p className="mt-1 max-w-[650px] text-[12px] leading-5 text-[#7d8b83]">
            Consulte e mantenha os valores nutricionais que serão usados nas refeições e nos planos alimentares.
          </p>
        </div>

        <div className="rounded-xl border border-[#e4ece5] bg-[#f5f9f5] px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#355743]">
            <Database size={15}/>
            Base atualizada
          </div>
          <div className="mt-1 text-[10px] text-[#87948b]">
            {pagination.totalItems} alimentos cadastrados
          </div>
        </div>
      </div>

    <section className="panel overflow-hidden">
      <div className="border-b border-[#edf1ed] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="section-title">
              Alimentos cadastrados
            </h2>
            <p className="section-subtitle">
              Valores de referência por porção indicada · {filtered.length} resultados listados
            </p>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2.5 text-[#98a39b] sm:w-[280px]">
            <Search size={15}/>
            <input
              aria-label="Buscar alimento"
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Buscar alimento..."
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#9ba69e]"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#78877e]">
            <Filter size={13}/>
            Filtros:
          </span>
          <select
            value={category}
            onChange={e=>setCategory(e.target.value)}
            className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none"
          >
            <option>Todas as categorias</option>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <select
            value={source}
            onChange={e=>setSource(e.target.value)}
            className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none"
          >
            <option>Todas as origens</option>
            <option>Manual</option>
            <option>Importação CSV</option>
            <option>API</option>
          </select>

          {(query||category!=="Todas as categorias"||source!=="Todas as origens") &&
          <button
            onClick={()=>{setQuery("");setCategory("Todas as categorias");
            setSource("Todas as origens")}}
            className="text-[11px] font-semibold text-[#287653]"
          >
            Limpar filtros
          </button>
          }
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead>
            <tr className="bg-[#fafcf9] text-[10px] font-semibold uppercase tracking-[.65px] text-[#87948b]">
              <th className="px-5 py-3">
                Alimento
              </th>
              <th className="px-4 py-3">
                Categoria
              </th>
              <th className="px-4 py-3">
                Porção
              </th>
              <th className="px-4 py-3">
                Kcal
              </th>
              <th className="px-4 py-3">
                Proteínas
              </th>
              <th className="px-4 py-3">
                Carboidratos
              </th>
              <th className="px-4 py-3">
                Gorduras
              </th>
              <th className="px-4 py-3">
                Origem
              </th>
              <th className="px-4 py-3"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f3f0]">
            {filtered.map(f=>
              <tr key={f.id} className="group hover:bg-[#fbfdfb]">
                <td className="px-5 py-3.5">
                  <div className="text-[12px] font-semibold text-[#304638]">
                    {f.nome}
                  </div>
                  <div className="mt-1 text-[10px] text-[#8a978f]">
                    Atualizado: {convertDateFromApi(f.atualizadoEm.toString())}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f?.grupo ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  100g
                </td>
                <td className="px-4 py-3.5 text-[12px] font-semibold text-[#304638]">
                  {f.energiaKcal}
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.proteinaG} g
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.carboidratoG} g
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.lipidiosG} g
                </td>
                <td className="px-4 py-3.5">
                  <span className={`pill ${f.fonte==="API"?"bg-[#edf2fa] text-[#5576a3]":f.fonte==="Manual"?"bg-[#e9f5ed] text-[#287653]":"bg-[#fff5e6] text-[#a8752c]"}`}>
                    {f.fonte}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1">
                    <button
                      aria-label={`Editar ${f.nome}`}
                      onClick={()=> toast.info("Edição de alimentos não está disponível nesta demonstração.")}
                      className="rounded-lg p-2 text-[#819087] hover:bg-white hover:text-[#287653]"
                    >
                      <Pencil size={14}/>
                    </button>
                    <button
                      aria-label={`Remover ${f.nome}`}
                      onClick={() => openModal(
                        <ModalDelete
                          title="Remover Alimento"
                          description={`Tem certeza que deseja remover ${f.nome}?`}
                          onConfirm={() => removeFood(f)}
                          onCancel={() => closeModal()}
                        />
                      )}
                      className="rounded-lg p-2 text-[#a0aaa2] hover:bg-white hover:text-[#b65c50]"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length===0&&
          <div className="px-6 py-12 text-center">
            <Search size={22} className="mx-auto mb-3 text-[#8e9c92]"/>
            <p className="text-[13px] font-semibold text-[#304638]">
              Nenhum alimento encontrado
            </p>
            <p className="mt-1 text-[11px] text-[#87948b]">Altere a busca ou remova algum filtro.</p>
          </div>
        }
      </div>
      <div className="flex flex-col gap-2 border-t border-[#edf1ed] px-5 py-3.5 sm:flex-row sm:justify-between">
        <p className="text-[10px] text-[#87948b]">Exibindo {filtered.length} de {pagination.totalItems} alimentos</p><p className="text-[10px] text-[#9aa59d]">Confira a fonte e a porção antes de usar em orientações clínicas.</p>
      </div>
    </section>
    </div>
  </main>
  </div>
  )
}
