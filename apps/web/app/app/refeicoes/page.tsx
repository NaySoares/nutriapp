'use client';

import {
  Apple,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileText,
  Flame,
  HeartPulse,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Users,
  Wallet,
  X,
  Utensils,
  Leaf,
  Layers3,
  Calculator,
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SideBar } from '../../../components/sidebar';

interface Food {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
interface Ingredient {
  foodId: number;
  grams: number;
}
type MealType = 'Preparada' | 'Composta';
interface Meal {
  id: number;
  name: string;
  type: MealType;
  category: string;
  portions: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  updated: string;
  description: string;
}
const foods: Food[] = [
  {
    id: 1,
    name: 'Aveia em flocos',
    kcal: 394,
    protein: 13.9,
    carbs: 66.6,
    fat: 8.5,
  },
  { id: 2, name: 'Banana-prata', kcal: 98, protein: 1.3, carbs: 26, fat: 0.1 },
  {
    id: 3,
    name: 'Peito de frango grelhado',
    kcal: 159,
    protein: 32,
    carbs: 0,
    fat: 2.5,
  },
  {
    id: 4,
    name: 'Arroz integral cozido',
    kcal: 124,
    protein: 2.6,
    carbs: 25.8,
    fat: 1,
  },
  {
    id: 5,
    name: 'Ovo de galinha cozido',
    kcal: 154,
    protein: 12.6,
    carbs: 1.2,
    fat: 10.6,
  },
  {
    id: 6,
    name: 'Iogurte natural',
    kcal: 61,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3,
  },
  { id: 7, name: 'Abacate', kcal: 96, protein: 1.2, carbs: 6, fat: 8.4 },
  {
    id: 8,
    name: 'Feijão carioca cozido',
    kcal: 76,
    protein: 4.8,
    carbs: 13.6,
    fat: 0.5,
  },
];
const initialMeals: Meal[] = [
  {
    id: 1,
    name: 'Café da manhã 1',
    type: 'Composta',
    category: 'Café da manhã',
    portions: 1,
    kcal: 352,
    protein: 15.5,
    carbs: 58.2,
    fat: 7.5,
    ingredients: [
      { foodId: 1, grams: 40 },
      { foodId: 2, grams: 100 },
      { foodId: 6, grams: 170 },
    ],
    updated: '19 out, 2026',
    description: 'Opção prática para o início do dia.',
  },
  {
    id: 2,
    name: 'Salada de frango com arroz',
    type: 'Composta',
    category: 'Almoço',
    portions: 1,
    kcal: 441,
    protein: 40.4,
    carbs: 51.6,
    fat: 7.1,
    ingredients: [
      { foodId: 3, grams: 100 },
      { foodId: 4, grams: 200 },
      { foodId: 8, grams: 100 },
    ],
    updated: '18 out, 2026',
    description: 'Refeição completa com fonte de proteína e leguminosas.',
  },
  {
    id: 3,
    name: 'Bolo de banana e aveia',
    type: 'Preparada',
    category: 'Lanche',
    portions: 8,
    kcal: 210,
    protein: 5.2,
    carbs: 32,
    fat: 7.1,
    ingredients: [],
    updated: '16 out, 2026',
    description:
      'Receita caseira. Valores por porção informados pela nutricionista.',
  },
  {
    id: 4,
    name: 'Omelete simples',
    type: 'Preparada',
    category: 'Café da manhã',
    portions: 1,
    kcal: 180,
    protein: 13,
    carbs: 2,
    fat: 13,
    ingredients: [],
    updated: '15 out, 2026',
    description: 'Preparação rápida com ovos.',
  },
  {
    id: 5,
    name: 'Lanche de iogurte com banana',
    type: 'Composta',
    category: 'Lanche',
    portions: 1,
    kcal: 159,
    protein: 5.1,
    carbs: 30.7,
    fat: 3.4,
    ingredients: [
      { foodId: 6, grams: 170 },
      { foodId: 2, grams: 100 },
    ],
    updated: '12 out, 2026',
    description: 'Combinação simples para um lanche.',
  },
];
const navGroups = [
  {
    title: 'ESPAÇO DE TRABALHO',
    items: [
      { label: 'Visão geral', icon: LayoutDashboard, href: '/' },
      { label: 'Pacientes', icon: Users, href: '/pacientes' },
      { label: 'Agenda', icon: CalendarDays, href: '/agenda' },
      { label: 'Planos alimentares', icon: Apple, href: '/planos-alimentares' },
      { label: 'Alimentos', icon: Leaf, href: '/alimentos' },
      { label: 'Refeições', icon: HeartPulse, href: '/refeicoes' },
    ],
  },
  {
    title: 'GESTÃO',
    items: [
      { label: 'Financeiro', icon: Wallet, href: '/financeiro' },
      { label: 'Relatórios', icon: FileText, href: '/relatorios' },
    ],
  },
];
const categories = [
  'Café da manhã',
  'Lanche',
  'Almoço',
  'Jantar',
  'Ceia',
  'Outro',
];
const emptyForm = {
  name: '',
  category: 'Café da manhã',
  portions: '1',
  description: '',
  kcal: '0',
  protein: '0',
  carbs: '0',
  fat: '0',
};
function calc(ingredients: Ingredient[]) {
  return ingredients.reduce(
    (sum, item) => {
      const food = foods.find((f) => f.id === item.foodId);
      if (!food) return sum;
      const factor = item.grams / 100;
      return {
        kcal: sum.kcal + food.kcal * factor,
        protein: sum.protein + food.protein * factor,
        carbs: sum.carbs + food.carbs * factor,
        fat: sum.fat + food.fat * factor,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
export default function MealsPage() {
  const [meals, setMeals] = useState(initialMeals);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos os tipos');
  const [categoryFilter, setCategoryFilter] = useState('Todas as categorias');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [type, setType] = useState<MealType>('Composta');
  const [form, setForm] = useState(emptyForm);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { foodId: 1, grams: 40 },
    { foodId: 2, grams: 100 },
  ]);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Meal | null>(null);
  const filtered = useMemo(
    () =>
      meals
        .filter((m) =>
          m.name
            .toLocaleLowerCase('pt-BR')
            .includes(query.toLocaleLowerCase('pt-BR')),
        )
        .filter((m) => typeFilter === 'Todos os tipos' || m.type === typeFilter)
        .filter(
          (m) =>
            categoryFilter === 'Todas as categorias' ||
            m.category === categoryFilter,
        )
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [meals, query, typeFilter, categoryFilter],
  );
  const totals =
    type === 'Composta'
      ? calc(ingredients)
      : {
          kcal: Number(form.kcal) || 0,
          protein: Number(form.protein) || 0,
          carbs: Number(form.carbs) || 0,
          fat: Number(form.fat) || 0,
        };
  function openNew() {
    setEditing(null);
    setType('Composta');
    setForm(emptyForm);
    setIngredients([
      { foodId: 1, grams: 40 },
      { foodId: 2, grams: 100 },
    ]);
    setModal(true);
  }
  function openEdit(meal: Meal) {
    setEditing(meal);
    setType(meal.type);
    setForm({
      name: meal.name,
      category: meal.category,
      portions: String(meal.portions),
      description: meal.description,
      kcal: String(meal.kcal),
      protein: String(meal.protein),
      carbs: String(meal.carbs),
      fat: String(meal.fat),
    });
    setIngredients(
      meal.ingredients.length ? meal.ingredients : [{ foodId: 1, grams: 100 }],
    );
    setModal(true);
  }
  function saveMeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (type === 'Composta' && !ingredients.length) {
      setNotice('Adicione ao menos um alimento à refeição.');
      return;
    }
    const nutrition =
      type === 'Composta'
        ? calc(ingredients)
        : {
            kcal: Number(form.kcal) || 0,
            protein: Number(form.protein) || 0,
            carbs: Number(form.carbs) || 0,
            fat: Number(form.fat) || 0,
          };
    const meal: Meal = {
      id: editing?.id ?? Date.now(),
      name: form.name.trim(),
      type,
      category: form.category,
      portions: Math.max(1, Number(form.portions) || 1),
      ...(Object.fromEntries(
        Object.entries(nutrition).map(([k, v]) => [k, Math.round(v * 10) / 10]),
      ) as Pick<Meal, 'kcal' | 'protein' | 'carbs' | 'fat'>),
      ingredients: type === 'Composta' ? ingredients : [],
      updated: 'Hoje',
      description: form.description.trim(),
    };
    setMeals((current) =>
      editing
        ? current.map((m) => (m.id === editing.id ? meal : m))
        : [meal, ...current],
    );
    setModal(false);
    setNotice(
      editing
        ? 'Refeição atualizada nesta demonstração.'
        : 'Refeição criada nesta demonstração.',
    );
    window.setTimeout(() => setNotice(''), 3000);
  }
  function removeMeal(meal: Meal) {
    if (window.confirm(`Remover ${meal.name} desta demonstração?`))
      setMeals((current) => current.filter((m) => m.id !== meal.id));
  }
  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { foodId: foods[0].id, grams: 100 },
    ]);
  }
  function updateIngredient(
    index: number,
    key: keyof Ingredient,
    value: number,
  ) {
    setIngredients((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );
  }
  return (
    <div className="min-h-screen">
      <SideBar mobileNavOpen={menuOpen} setMobileNavOpen={setMenuOpen} />
      <main className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu rounded-lg border border-[#e8eee9] p-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Utensils size={18} />
            </button>
            <div>
              <div className="text-[11px] text-[#849188]">
                Biblioteca nutricional
              </div>
              <div className="mt-1 text-[17px] font-bold">Refeições</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notificações"
              className="rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"
              onClick={() => setNotice('Nenhuma notificação nova.')}
            >
              <Bell size={16} />
            </button>
            <button className="btn-primary" onClick={openNew}>
              <Plus size={15} />
              Nova refeição
            </button>
          </div>
        </header>
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
                  {meals.filter((m) => m.type === 'Composta').length}
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
                  {meals.filter((m) => m.type === 'Preparada').length}
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
                  <option>Todos os tipos</option>
                  <option>Preparada</option>
                  <option>Composta</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a]"
                >
                  <option>Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {(query ||
                  typeFilter !== 'Todos os tipos' ||
                  categoryFilter !== 'Todas as categorias') && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setTypeFilter('Todos os tipos');
                      setCategoryFilter('Todas as categorias');
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
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Energia</th>
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
                          onClick={() => setSelected(m)}
                        >
                          <span className="block text-[12px] font-semibold text-[#304638] group-hover:text-[#287653]">
                            {m.name}
                          </span>
                          <span className="mt-1 block max-w-[250px] truncate text-[10px] text-[#8a978f]">
                            {m.description ||
                              `${m.ingredients.length} ingredientes`}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`pill ${m.type === 'Composta' ? 'bg-[#edf2fa] text-[#5576a3]' : 'bg-[#e9f5ed] text-[#287653]'}`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m.category}
                      </td>
                      <td className="px-4 py-3.5 text-[12px] font-semibold text-[#304638]">
                        {Math.round(m.kcal)} kcal
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m.protein.toFixed(1)} g
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m.carbs.toFixed(1)} g
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#53665a]">
                        {m.fat.toFixed(1)} g
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#718278]">
                        {m.updated}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button
                            aria-label={`Editar ${m.name}`}
                            onClick={() => openEdit(m)}
                            className="rounded-lg p-2 text-[#819087] hover:bg-white hover:text-[#287653]"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            aria-label={`Duplicar ${m.name}`}
                            onClick={() => {
                              setMeals((current) => [
                                {
                                  ...m,
                                  id: Date.now(),
                                  name: `${m.name} (cópia)`,
                                  updated: 'Hoje',
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
                            aria-label={`Remover ${m.name}`}
                            onClick={() => removeMeal(m)}
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
                    onClick={openNew}
                    className="mt-3 text-[11px] font-semibold text-[#287653]"
                  >
                    Criar refeição
                  </button>
                </div>
              )}
            </div>
            <div className="border-t border-[#edf1ed] px-5 py-3.5 text-[10px] text-[#87948b]">
              Exibindo {filtered.length} de {meals.length} refeições · valores
              demonstrativos
            </div>
          </section>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#e5ece5] bg-[#f7faf7] p-4">
            <CircleAlert size={16} className="mt-0.5 shrink-0 text-[#7b9882]" />
            <div>
              <p className="text-[11px] font-semibold text-[#355743]">
                Dois tipos, dois fluxos de criação
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#7d8b83]">
                Preparadas: receitas como bolos e tortas, com os valores por
                porção informados no cadastro. Compostas: seleções de alimentos
                em que calorias e macronutrientes são calculados automaticamente
                pela soma das quantidades.
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
      {modal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
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
              <button
                onClick={() => setModal(false)}
                aria-label="Fechar"
                className="p-2 text-[#87948b]"
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={saveMeal} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setType('Composta')}
                  className={`rounded-xl border p-3 text-left ${type === 'Composta' ? 'border-[#8ab69a] bg-[#f2f8f3]' : 'border-[#e6ece7]'}`}
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
                  onClick={() => setType('Preparada')}
                  className={`rounded-xl border p-3 text-left ${type === 'Preparada' ? 'border-[#8ab69a] bg-[#f2f8f3]' : 'border-[#e6ece7]'}`}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Nome da refeição *
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex.: Café da manhã 1"
                    className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                    Categoria
                  </span>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px]"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
                  Descrição / preparo (opcional)
                </span>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Observações para uso futuro nos planos alimentares"
                  className="w-full resize-y rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                />
              </label>
              {type === 'Composta' ? (
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
                      onClick={addIngredient}
                      className="btn-secondary"
                    >
                      <Plus size={13} />
                      Adicionar item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[minmax(0,1fr)_100px_32px] items-center gap-2"
                      >
                        <select
                          aria-label={`Alimento ${index + 1}`}
                          value={item.foodId}
                          onChange={(e) =>
                            updateIngredient(
                              index,
                              'foodId',
                              Number(e.target.value),
                            )
                          }
                          className="min-w-0 rounded-lg border border-[#e3eae4] bg-white px-2.5 py-2.5 text-[11px]"
                        >
                          {foods.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 rounded-lg border border-[#e3eae4] px-2">
                          <input
                            aria-label="Quantidade em gramas"
                            type="number"
                            min="1"
                            step="1"
                            value={item.grams}
                            onChange={(e) =>
                              updateIngredient(
                                index,
                                'grams',
                                Math.max(0, Number(e.target.value)),
                              )
                            }
                            className="w-full py-2.5 text-[11px] outline-none"
                          />
                          <span className="text-[10px] text-[#87948b]">g</span>
                        </label>
                        <button
                          type="button"
                          aria-label="Remover ingrediente"
                          disabled={ingredients.length === 1}
                          onClick={() =>
                            setIngredients((current) =>
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
              ) : (
                <div className="rounded-xl border border-[#e7eee8] p-4">
                  <h3 className="mb-1 text-[12px] font-bold text-[#304638]">
                    Valores nutricionais por porção
                  </h3>
                  <p className="mb-3 text-[10px] text-[#87948b]">
                    Para preparações, informe os valores calculados da receita
                    por porção.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(
                      [
                        { key: 'kcal', label: 'Energia (kcal)' },
                        { key: 'protein', label: 'Proteínas (g)' },
                        { key: 'carbs', label: 'Carboidratos (g)' },
                        { key: 'fat', label: 'Gorduras (g)' },
                      ] as const
                    ).map((n) => (
                      <label key={n.key}>
                        <span className="mb-1.5 block text-[10px] text-[#87948b]">
                          {n.label}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form[n.key]}
                          onChange={(e) =>
                            setForm({ ...form, [n.key]: e.target.value })
                          }
                          className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e]"
                        />
                      </label>
                    ))}
                  </div>
                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-[10px] text-[#87948b]">
                      Rendimento da receita (porções)
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.portions}
                      onChange={(e) =>
                        setForm({ ...form, portions: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none sm:max-w-[180px]"
                    />
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModal(false)}
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
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#17251d]/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`pill ${selected.type === 'Composta' ? 'bg-[#edf2fa] text-[#5576a3]' : 'bg-[#e9f5ed] text-[#287653]'}`}
                >
                  {selected.type}
                </span>
                <h2 className="mt-3 text-[18px] font-bold text-[#20352c]">
                  {selected.name}
                </h2>
                <p className="mt-1 text-[11px] text-[#87948b]">
                  {selected.description || selected.category}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                className="p-2 text-[#87948b]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                {
                  label: 'Energia',
                  value: `${Math.round(selected.kcal)} kcal`,
                },
                {
                  label: 'Proteínas',
                  value: `${selected.protein.toFixed(1)} g`,
                },
                {
                  label: 'Carboidratos',
                  value: `${selected.carbs.toFixed(1)} g`,
                },
                { label: 'Gorduras', value: `${selected.fat.toFixed(1)} g` },
              ].map((n) => (
                <div key={n.label} className="rounded-xl bg-[#f6f9f6] p-3">
                  <div className="text-[10px] text-[#87948b]">{n.label}</div>
                  <div className="mt-1 text-[13px] font-bold text-[#304638]">
                    {n.value}
                  </div>
                </div>
              ))}
            </div>
            {selected.type === 'Composta' && (
              <div className="mt-4">
                <h3 className="mb-2 text-[11px] font-bold text-[#304638]">
                  Ingredientes
                </h3>
                {selected.ingredients.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-[#edf1ed] py-2 text-[11px] text-[#53665a]"
                  >
                    <span>{foods.find((f) => f.id === item.foodId)?.name}</span>
                    <span>{item.grams} g</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setSelected(null)}
              >
                Fechar
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelected(null);
                  openEdit(selected);
                }}
              >
                <Pencil size={14} />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
