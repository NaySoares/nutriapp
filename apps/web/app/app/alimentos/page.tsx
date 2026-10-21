"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {Bell, Check, Filter, Pencil, Plus, Search, Trash2, X, Database, Leaf } from "lucide-react";
import { SideBar } from "../../../components/sidebar";

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

const blankFood = { name: "", category: "Frutas", portion: "100 g", kcal: "0", protein: "0", carbs: "0", fat: "0", fiber: "0" };

export default function FoodsPage() {
  const [foods, setFoods] = useState(seedFoods);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas as categorias");
  const [source, setSource] = useState("Todas as origens");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState(blankFood);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => foods.filter(f => f.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).filter(f => category === "Todas as categorias" || f.category === category).filter(f => source === "Todas as origens" || f.source === source).sort((a,b) => a.name.localeCompare(b.name,"pt-BR")), [foods, query, category, source]);

  function startAdd() {
    setEditing(null);
    setForm(blankFood);
    setModal(true);
  }

  function startEdit(food: Food) {
    setEditing(food);
    setForm({
      name: food.name,
      category: food.category,
      portion: food.portion,
      kcal: String(food.kcal),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
      fiber: String(food.fiber)
    });

    setModal(true);
  }

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

    setFoods(current => editing ? current.map(f => f.id === editing.id ? food : f) : [food, ...current]); setModal(false); setNotice(editing ? "Alimento atualizado nesta demonstração." : "Alimento cadastrado nesta demonstração.");

    window.setTimeout(() => setNotice(""), 3000);
  }

  function removeFood(food: Food) {
    if (window.confirm(`Remover ${food.name} desta lista de demonstração?`)) {
      setFoods(current => current.filter(f => f.id !== food.id));
    }
  }

  return (
  <div className="min-h-screen">
    <SideBar mobileNavOpen={menuOpen} setMobileNavOpen={setMenuOpen} />
    <main className="main">
      <header className="topbar">
        <div className="flex items-center gap-3">
          <button
            className="mobile-menu rounded-lg border border-[#e8eee9] p-2"
            onClick={()=>setMenuOpen(true)}
            aria-label="Abrir menu"
          >
              <Leaf size={18}/>
          </button>
          <div>
            <div className="text-[11px] text-[#849188]">
              Biblioteca nutricional
            </div>
            <div className="mt-1 text-[17px] font-bold">
              Alimentos
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notificações"
            className="rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"
            onClick={()=>setNotice("Nenhuma notificação nova.")}
          >
            <Bell size={16}/>
          </button>
          <button
            className="btn-primary"
            onClick={startAdd}
          >
            <Plus size={15}/>
            Adicionar alimento
          </button>
        </div>
      </header>

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
            {foods.length} alimentos cadastrados
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
              Valores de referência por porção indicada · {filtered.length} resultados
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
                    {f.name}
                  </div>
                  <div className="mt-1 text-[10px] text-[#8a978f]">
                    Atualizado: {f.updated}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.category}
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.portion}
                </td>
                <td className="px-4 py-3.5 text-[12px] font-semibold text-[#304638]">
                  {f.kcal}
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.protein} g
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.carbs} g
                </td>
                <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                  {f.fat} g
                </td>
                <td className="px-4 py-3.5">
                  <span className={`pill ${f.source==="API"?"bg-[#edf2fa] text-[#5576a3]":f.source==="Manual"?"bg-[#e9f5ed] text-[#287653]":"bg-[#fff5e6] text-[#a8752c]"}`}>
                    {f.source}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1">
                    <button
                      aria-label={`Editar ${f.name}`}
                      onClick={()=>startEdit(f)}
                      className="rounded-lg p-2 text-[#819087] hover:bg-white hover:text-[#287653]"
                    >
                      <Pencil size={14}/>
                    </button>
                    <button
                      aria-label={`Remover ${f.name}`}
                      onClick={()=>removeFood(f)}
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
        <p className="text-[10px] text-[#87948b]">Exibindo {filtered.length} de {foods.length} alimentos</p><p className="text-[10px] text-[#9aa59d]">Confira a fonte e a porção antes de usar em orientações clínicas.</p>
      </div>
    </section>
    </div>
  </main>
  {notice&&
    <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-[12px] text-[#355743] shadow-lg">
      <Check size={15}/>{notice}
      <button onClick={()=>setNotice("")}>
        <X size={13}/>
      </button>
    </div>}

  {modal&&
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}>
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
          <button
            onClick={()=>setModal(false)}
            aria-label="Fechar"
            className="p-2 text-[#87948b]"
          >
            <X size={17}/>
          </button>
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
              onClick={()=>setModal(false)}>
                Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={14}/>{editing?"Salvar alterações":"Salvar alimento"}
            </button>
          </div>
        </form>
      </div>
    </div>}
  </div>
  )
}
