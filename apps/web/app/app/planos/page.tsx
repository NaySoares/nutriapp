'use client';

import {
  Apple,
  Archive,
  Bell,
  Check,
  CircleAlert,
  Copy,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  X,
  Clock3,
  Utensils,
  Flame,
  Eye,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SideBar } from '../../../components/layout/sidebar';

interface Meal {
  name: string;
  time: string;
  items: string[];
}
interface FoodPlanTemplate {
  id: number;
  name: string;
  description: string;
  goal: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
  restrictions: string[];
  tags: string[];
  status: 'Publicado' | 'Rascunho';
  uses: number;
  updated: string;
}

const initialTemplates: FoodPlanTemplate[] = [
  {
    id: 1,
    name: 'Ganho de massa — rotina equilibrada',
    description:
      'Estrutura inicial para adultos com foco em aumento de massa muscular e refeições distribuídas ao longo do dia.',
    goal: 'Ganho de massa',
    category: 'Hipertrofia',
    calories: 2600,
    protein: 150,
    carbs: 320,
    fat: 75,
    meals: [
      {
        name: 'Café da manhã',
        time: '07:00',
        items: ['Ovos mexidos', 'Pão integral', 'Banana'],
      },
      {
        name: 'Lanche da manhã',
        time: '10:00',
        items: ['Iogurte natural', 'Aveia'],
      },
      {
        name: 'Almoço',
        time: '12:30',
        items: ['Arroz integral', 'Feijão', 'Frango grelhado', 'Salada'],
      },
      {
        name: 'Lanche da tarde',
        time: '16:00',
        items: ['Vitamina de banana', 'Pasta de amendoim'],
      },
      {
        name: 'Jantar',
        time: '19:30',
        items: ['Batata-doce', 'Peixe grelhado', 'Legumes'],
      },
      { name: 'Ceia', time: '21:30', items: ['Queijo branco', 'Fruta'] },
    ],
    restrictions: [],
    tags: ['6 refeições', 'Alta proteína'],
    status: 'Publicado',
    uses: 18,
    updated: '18 out, 2026',
  },
  {
    id: 2,
    name: 'Ganho de massa — sem leite',
    description:
      'Modelo de referência para hipertrofia com alternativas sem leite e derivados lácteos.',
    goal: 'Ganho de massa',
    category: 'Hipertrofia',
    calories: 2450,
    protein: 145,
    carbs: 300,
    fat: 70,
    meals: [
      {
        name: 'Café da manhã',
        time: '07:00',
        items: ['Ovos mexidos', 'Pão integral', 'Mamão'],
      },
      {
        name: 'Lanche da manhã',
        time: '10:00',
        items: ['Banana', 'Aveia', 'Bebida vegetal'],
      },
      {
        name: 'Almoço',
        time: '12:30',
        items: ['Arroz', 'Feijão', 'Frango grelhado', 'Legumes'],
      },
      {
        name: 'Lanche da tarde',
        time: '16:00',
        items: ['Sanduíche de atum', 'Fruta'],
      },
      {
        name: 'Jantar',
        time: '19:30',
        items: ['Mandioca', 'Carne magra', 'Salada'],
      },
    ],
    restrictions: ['Sem leite e derivados'],
    tags: ['5 refeições', 'Sem lácteos'],
    status: 'Publicado',
    uses: 11,
    updated: '16 out, 2026',
  },
  {
    id: 3,
    name: 'Reeducação alimentar — rotina prática',
    description:
      'Base flexível para organizar refeições simples e favorecer consistência na rotina alimentar.',
    goal: 'Reeducação alimentar',
    category: 'Hábitos',
    calories: 1900,
    protein: 105,
    carbs: 220,
    fat: 60,
    meals: [
      {
        name: 'Café da manhã',
        time: '07:30',
        items: ['Pão integral', 'Ovo', 'Fruta'],
      },
      {
        name: 'Almoço',
        time: '12:00',
        items: ['Arroz', 'Feijão', 'Proteína magra', 'Salada'],
      },
      {
        name: 'Lanche da tarde',
        time: '15:30',
        items: ['Iogurte natural', 'Fruta'],
      },
      { name: 'Jantar', time: '19:00', items: ['Sopa de legumes com frango'] },
    ],
    restrictions: [],
    tags: ['4 refeições', 'Rotina prática'],
    status: 'Publicado',
    uses: 24,
    updated: '14 out, 2026',
  },
  {
    id: 4,
    name: 'Manutenção — rotina vegetariana',
    description:
      'Modelo vegetariano para manutenção de peso, com variedade de fontes de proteína vegetal.',
    goal: 'Manutenção',
    category: 'Vegetariano',
    calories: 2100,
    protein: 95,
    carbs: 275,
    fat: 65,
    meals: [
      {
        name: 'Café da manhã',
        time: '07:30',
        items: ['Aveia', 'Bebida vegetal', 'Fruta'],
      },
      {
        name: 'Almoço',
        time: '12:30',
        items: ['Arroz integral', 'Lentilha', 'Tofu', 'Salada'],
      },
      { name: 'Lanche da tarde', time: '16:00', items: ['Castanhas', 'Fruta'] },
      {
        name: 'Jantar',
        time: '19:30',
        items: ['Grão-de-bico', 'Legumes assados', 'Quinoa'],
      },
    ],
    restrictions: ['Vegetariano'],
    tags: ['4 refeições', 'Vegetariano'],
    status: 'Rascunho',
    uses: 3,
    updated: '12 out, 2026',
  },
  {
    id: 5,
    name: 'Rotina esportiva — treino à tarde',
    description:
      'Distribuição de refeições para rotina com treino no período da tarde; ajustar horários e porções individualmente.',
    goal: 'Performance esportiva',
    category: 'Esportivo',
    calories: 2800,
    protein: 160,
    carbs: 360,
    fat: 75,
    meals: [
      { name: 'Café da manhã', time: '07:00', items: ['Ovos', 'Pão', 'Fruta'] },
      {
        name: 'Almoço',
        time: '12:00',
        items: ['Arroz', 'Feijão', 'Frango', 'Legumes'],
      },
      { name: 'Pré-treino', time: '15:30', items: ['Banana', 'Aveia'] },
      {
        name: 'Pós-treino',
        time: '18:00',
        items: ['Sanduíche de frango', 'Suco natural'],
      },
      { name: 'Jantar', time: '20:00', items: ['Batata', 'Peixe', 'Salada'] },
    ],
    restrictions: [],
    tags: ['5 refeições', 'Treino à tarde'],
    status: 'Publicado',
    uses: 9,
    updated: '10 out, 2026',
  },
];

const goals = [
  'Todos os objetivos',
  'Ganho de massa',
  'Reeducação alimentar',
  'Manutenção',
  'Performance esportiva',
];
const blankTemplate = {
  name: '',
  description: '',
  goal: 'Ganho de massa',
  category: 'Hipertrofia',
  calories: '2000',
  protein: '120',
  carbs: '250',
  fat: '65',
  status: 'Rascunho' as FoodPlanTemplate['status'],
  restrictions: '',
  mealsText:
    'Café da manhã | 07:00 | Ovos, pão e fruta\nAlmoço | 12:30 | Arroz, feijão, proteína e salada\nJantar | 19:30 | Proteína, carboidrato e legumes',
};

export default function PlansPage() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [query, setQuery] = useState('');
  const [goal, setGoal] = useState('Todos os objetivos');
  const [status, setStatus] = useState('Todos os status');
  const [sort, setSort] = useState('Mais utilizados');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<
    'create' | 'edit' | 'details' | 'assign' | null
  >(null);
  const [selected, setSelected] = useState<FoodPlanTemplate | null>(null);
  const [form, setForm] = useState(blankTemplate);
  const [patient, setPatient] = useState('Mariana Costa');
  const [patientSearch, setPatientSearch] = useState('');

  const filtered = useMemo(() => {
    const result = templates
      .filter((item) =>
        `${item.name} ${item.description} ${item.goal} ${item.tags.join(' ')}`
          .toLocaleLowerCase('pt-BR')
          .includes(query.toLocaleLowerCase('pt-BR')),
      )
      .filter((item) => goal === 'Todos os objetivos' || item.goal === goal)
      .filter((item) => status === 'Todos os status' || item.status === status);
    if (sort === 'Mais recentes') result.sort((a, b) => b.id - a.id);
    else if (sort === 'Nome A–Z')
      result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    else result.sort((a, b) => b.uses - a.uses);
    return result;
  }, [templates, query, goal, status, sort]);

  const totalUses = templates.reduce((sum, item) => sum + item.uses, 0);
  const published = templates.filter(
    (item) => item.status === 'Publicado',
  ).length;
  const mostUsed = [...templates].sort((a, b) => b.uses - a.uses)[0];

  function toast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  }

  function startCreate() {
    setSelected(null);
    setForm(blankTemplate);
    setModal('create');
  }

  function startEdit(template: FoodPlanTemplate) {
    setSelected(template);
    setForm({
      name: template.name,
      description: template.description,
      goal: template.goal,
      category: template.category,
      calories: String(template.calories),
      protein: String(template.protein),
      carbs: String(template.carbs),
      fat: String(template.fat),
      status: template.status,
      restrictions: template.restrictions.join(', '),
      mealsText: template.meals
        .map((meal) => `${meal.name} | ${meal.time} | ${meal.items.join(', ')}`)
        .join('\n'),
    });
    setModal('edit');
  }

  function saveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const meals: Meal[] = form.mealsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const parts = line.split('|').map((part) => part.trim());
        return {
          name: parts[0] || `Refeição ${index + 1}`,
          time: parts[1] || 'A definir',
          items: (parts[2] || 'Itens a definir')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        };
      });
    const next: FoodPlanTemplate = {
      id: selected?.id ?? Math.max(0, ...templates.map((item) => item.id)) + 1,
      name: form.name.trim(),
      description: form.description.trim(),
      goal: form.goal,
      category: form.category,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      meals,
      restrictions: form.restrictions
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      tags: [`${meals.length} refeições`, form.goal],
      status: form.status,
      uses: selected?.uses ?? 0,
      updated: 'Hoje',
    };
    setTemplates((current) =>
      selected
        ? current.map((item) => (item.id === selected.id ? next : item))
        : [next, ...current],
    );
    setModal(null);
    toast(
      selected
        ? 'Modelo atualizado nesta demonstração.'
        : 'Modelo criado nesta demonstração.',
    );
  }

  function duplicateTemplate(template: FoodPlanTemplate) {
    const copy: FoodPlanTemplate = {
      ...template,
      id: Math.max(0, ...templates.map((item) => item.id)) + 1,
      name: `${template.name} (cópia)`,
      status: 'Rascunho',
      uses: 0,
      updated: 'Hoje',
      meals: template.meals.map((meal) => ({
        ...meal,
        items: [...meal.items],
      })),
      restrictions: [...template.restrictions],
      tags: [...template.tags],
    };
    setTemplates((current) => [copy, ...current]);
    toast('Cópia criada como rascunho.');
  }

  function archiveTemplate(template: FoodPlanTemplate) {
    if (
      window.confirm(
        `Arquivar o modelo “${template.name}”? Ele deixará de aparecer na lista principal.`,
      )
    ) {
      setTemplates((current) =>
        current.filter((item) => item.id !== template.id),
      );
      toast('Modelo arquivado nesta demonstração.');
    }
  }

  function assignTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    toast(
      `Modelo preparado para ${patient}. A cópia individual será ajustada no prontuário do paciente.`,
    );
    setModal(null);
  }

  const fieldClass =
    'w-full rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[12px] text-[#304638] outline-none focus:border-[#7fb18e]';
  const labelClass = 'mb-1.5 block text-[11px] font-semibold text-[#53665a]';

  return (
    <div className="min-h-screen">
      <main className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu rounded-lg border border-[#e8eee9] p-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Apple size={18} />
            </button>
            <div>
              <div className="text-[11px] text-[#849188]">
                Biblioteca clínica
              </div>
              <div className="mt-1 text-[17px] font-bold">
                Planos alimentares
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notificações"
              className="rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"
              onClick={() => toast('Nenhuma notificação nova.')}
            >
              <Bell size={16} />
            </button>
            <button className="btn-primary" onClick={startCreate}>
              <Plus size={15} />
              Novo modelo
            </button>
          </div>
        </header>

        <div className="content">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
                BIBLIOTECA DE MODELOS
              </div>
              <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
                Modelos de planos alimentares
              </h1>
              <p className="mt-1 max-w-[690px] text-[12px] leading-5 text-[#7d8b83]">
                Reaproveite estruturas de refeições e adapte cada plano às
                necessidades do paciente. Usar um modelo cria uma cópia
                individual, sem alterar o original.
              </p>
            </div>
            <button className="btn-primary" onClick={startCreate}>
              <Plus size={15} />
              Criar modelo
            </button>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                <ClipboardList size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Modelos cadastrados
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#20352c]">
                  {templates.length}
                </div>
                <div className="mt-0.5 text-[10px] text-[#87948b]">
                  Estruturas reutilizáveis
                </div>
              </div>
            </div>
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2fa] text-[#5576a3]">
                <Check size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Disponíveis para uso
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#20352c]">
                  {published}
                </div>
                <div className="mt-0.5 text-[10px] text-[#87948b]">
                  Modelos publicados
                </div>
              </div>
            </div>
            <div className="panel flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
                <Users size={18} />
              </div>
              <div>
                <div className="text-[11px] text-[#7d8b83]">
                  Usos registrados
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#20352c]">
                  {totalUses}
                </div>
                <div className="mt-0.5 text-[10px] text-[#87948b]">
                  Atribuições demonstrativas
                </div>
              </div>
            </div>
            <div className="panel p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6b7b70]">
                <Sparkles size={15} className="text-[#4a9569]" />
                Modelo mais utilizado
              </div>
              <div className="mt-2 line-clamp-1 text-[13px] font-bold text-[#304638]">
                {mostUsed?.name}
              </div>
              <div className="mt-1 text-[10px] text-[#87948b]">
                {mostUsed?.uses} usos · bom ponto de partida
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#dfece2] bg-[#f5faf6] p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#3f8057]">
              <Target size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#355743]">
                Modelo não é o plano ativo do paciente
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#718278]">
                Ao aplicar um modelo, o sistema deve criar uma cópia no
                prontuário do paciente. Alterações nessa cópia não modificam o
                modelo nem os planos de outras pessoas. Revise alergias,
                restrições, porções e metas antes de finalizar.
              </p>
            </div>
          </div>

          <section className="panel overflow-hidden">
            <div className="border-b border-[#edf1ed] p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="section-title">Biblioteca de modelos</h2>
                  <p className="section-subtitle">
                    Encontre uma estrutura para adaptar · {filtered.length}{' '}
                    {filtered.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-[#e7ece7] bg-[#fbfcfb] px-3 py-2.5 text-[#98a39b] xl:w-[300px]">
                  <Search size={15} />
                  <input
                    aria-label="Buscar modelos"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por nome, objetivo..."
                    className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#9ba69e]"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#78877e]">
                  <Filter size={13} />
                  Filtros:
                </span>
                <select
                  aria-label="Filtrar por objetivo"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none"
                >
                  {goals.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  aria-label="Filtrar por status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none"
                >
                  <option>Todos os status</option>
                  <option>Publicado</option>
                  <option>Rascunho</option>
                </select>
                <div className="ml-auto flex items-center gap-2 text-[11px] text-[#87948b]">
                  <span>Ordenar por</span>
                  <select
                    aria-label="Ordenar modelos"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="rounded-lg border border-[#e5ebe6] bg-white px-3 py-2 text-[11px] text-[#53665a] outline-none"
                  >
                    <option>Mais utilizados</option>
                    <option>Mais recentes</option>
                    <option>Nome A–Z</option>
                  </select>
                </div>
                {(query ||
                  goal !== 'Todos os objetivos' ||
                  status !== 'Todos os status') && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setGoal('Todos os objetivos');
                      setStatus('Todos os status');
                    }}
                    className="text-[11px] font-semibold text-[#287653]"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#fafcf9] text-[10px] font-semibold uppercase tracking-[.65px] text-[#87948b]">
                    <th className="px-5 py-3">Modelo</th>
                    <th className="px-4 py-3">Objetivo</th>
                    <th className="px-4 py-3">Energia / dia</th>
                    <th className="px-4 py-3">Proteínas</th>
                    <th className="px-4 py-3">Refeições</th>
                    <th className="px-4 py-3">Utilizações</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f0]">
                  {filtered.map((template) => (
                    <tr key={template.id} className="group hover:bg-[#fbfdfb]">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                            <Apple size={16} />
                          </div>
                          <div className="min-w-0">
                            <button
                              className="text-left text-[12px] font-semibold text-[#304638] hover:text-[#287653]"
                              onClick={() => {
                                setSelected(template);
                                setModal('details');
                              }}
                            >
                              {template.name}
                            </button>
                            <div className="mt-1 max-w-[330px] text-[10px] leading-4 text-[#87948b]">
                              {template.description}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.restrictions.map((restriction) => (
                                <span
                                  key={restriction}
                                  className="rounded-md bg-[#fff4e5] px-2 py-1 text-[9px] font-medium text-[#9b6c29]"
                                >
                                  {restriction}
                                </span>
                              ))}
                              {template.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-[#f1f5f1] px-2 py-1 text-[9px] text-[#6c7d71]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[10px] font-medium text-[#477653]">
                          {template.goal}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#304638]">
                          <Flame size={14} className="text-[#c18a46]" />
                          {template.calories.toLocaleString('pt-BR')}{' '}
                          <span className="text-[10px] font-normal text-[#87948b]">
                            kcal
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-[#87948b]">
                          {template.carbs} g carb. · {template.fat} g gord.
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[12px] font-semibold text-[#304638]">
                        {template.protein} g
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#53665a]">
                          <Utensils size={13} className="text-[#87948b]" />
                          {template.meals.length} refeições
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[12px] font-semibold text-[#304638]">
                          {template.uses}
                        </div>
                        <div className="mt-1 text-[10px] text-[#87948b]">
                          Últ. edição: {template.updated}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`pill ${template.status === 'Publicado' ? 'bg-[#e9f5ed] text-[#287653]' : 'bg-[#fff5e6] text-[#a8752c]'}`}
                        >
                          {template.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            aria-label={`Visualizar ${template.name}`}
                            title="Visualizar"
                            onClick={() => {
                              setSelected(template);
                              setModal('details');
                            }}
                            className="rounded-lg p-2 text-[#819087] hover:bg-white hover:text-[#287653]"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            aria-label={`Aplicar ${template.name}`}
                            title="Usar modelo"
                            onClick={() => {
                              setSelected(template);
                              setModal('assign');
                            }}
                            className="rounded-lg p-2 text-[#287653] hover:bg-[#e9f5ed]"
                          >
                            <ArrowRight size={14} />
                          </button>
                          <div className="relative">
                            <details className="group/menu">
                              <summary
                                aria-label="Mais ações"
                                className="cursor-pointer list-none rounded-lg p-2 text-[#819087] hover:bg-white"
                              >
                                <MoreHorizontal size={15} />
                              </summary>
                              <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-[#e5ebe6] bg-white p-1 shadow-lg">
                                <button
                                  onClick={() => startEdit(template)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-[#53665a] hover:bg-[#f6f9f6]"
                                >
                                  <Pencil size={13} />
                                  Editar modelo
                                </button>
                                <button
                                  onClick={() => duplicateTemplate(template)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-[#53665a] hover:bg-[#f6f9f6]"
                                >
                                  <Copy size={13} />
                                  Duplicar
                                </button>
                                <button
                                  onClick={() => archiveTemplate(template)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-[#a65c4e] hover:bg-[#fff6f4]"
                                >
                                  <Archive size={13} />
                                  Arquivar
                                </button>
                              </div>
                            </details>
                          </div>
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
                    Nenhum modelo encontrado
                  </p>
                  <p className="mt-1 text-[11px] text-[#87948b]">
                    Tente alterar os filtros ou crie um novo modelo.
                  </p>
                  <button onClick={startCreate} className="btn-primary mt-4">
                    <Plus size={14} />
                    Criar modelo
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-[#edf1ed] px-5 py-3.5 sm:flex-row sm:justify-between">
              <p className="text-[10px] text-[#87948b]">
                Exibindo {filtered.length} de {templates.length} modelos
              </p>
              <p className="text-[10px] text-[#9aa59d]">
                Os valores nutricionais são referências e devem ser
                individualizados.
              </p>
            </div>
          </section>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="panel flex items-start gap-3 p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf2fa] text-[#5576a3]">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#304638]">
                  Precisa montar o plano de alguém?
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#7d8b83]">
                  Abra o paciente para consultar os planos individuais, manter o
                  histórico e acompanhar o plano vigente.
                </p>
                <Link
                  href="/pacientes"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#287653]"
                >
                  Ir para pacientes <ArrowRight size={13} />
                </Link>
              </div>
            </div>
            <div className="panel flex items-start gap-3 p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fff5e6] text-[#a8752c]">
                <CircleAlert size={16} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#304638]">
                  Segurança na reutilização
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#7d8b83]">
                  Não presuma que um modelo é adequado só pelo objetivo. Valide
                  alergias, condições clínicas, preferências, porções e
                  necessidades energéticas de cada paciente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-[12px] text-[#355743] shadow-lg"
        >
          <Check size={15} />
          {notice}
          <button aria-label="Fechar aviso" onClick={() => setNotice('')}>
            <X size={13} />
          </button>
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-modal-title"
            className="my-auto max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
                  BIBLIOTECA DE MODELOS
                </div>
                <h2
                  id="template-modal-title"
                  className="text-[20px] font-bold text-[#20352c]"
                >
                  {modal === 'edit' ? 'Editar modelo' : 'Novo modelo alimentar'}
                </h2>
                <p className="mt-1 text-[11px] text-[#87948b]">
                  Defina uma estrutura que possa ser adaptada antes de ser
                  atribuída a um paciente.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                aria-label="Fechar"
                className="p-2 text-[#87948b]"
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={saveTemplate} className="space-y-4">
              <label className="block">
                <span className={labelClass}>Nome do modelo *</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Ex.: Ganho de massa — sem lactose"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Descrição</span>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Para que tipo de rotina este modelo serve?"
                  className={fieldClass}
                />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Objetivo principal</span>
                  <select
                    value={form.goal}
                    onChange={(event) =>
                      setForm({ ...form, goal: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {goals.slice(1).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                    <option>Emagrecimento</option>
                    <option>Saúde e bem-estar</option>
                  </select>
                </label>
                <label>
                  <span className={labelClass}>Categoria</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {[
                      'Hipertrofia',
                      'Hábitos',
                      'Vegetariano',
                      'Esportivo',
                      'Clínico',
                      'Rotina prática',
                      'Outro',
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <div className={labelClass}>
                  Valores nutricionais de referência por dia
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <label>
                    <span className="mb-1 block text-[10px] text-[#87948b]">
                      Energia (kcal)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.calories}
                      onChange={(event) =>
                        setForm({ ...form, calories: event.target.value })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] text-[#87948b]">
                      Proteínas (g)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.protein}
                      onChange={(event) =>
                        setForm({ ...form, protein: event.target.value })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] text-[#87948b]">
                      Carboidratos (g)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.carbs}
                      onChange={(event) =>
                        setForm({ ...form, carbs: event.target.value })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] text-[#87948b]">
                      Gorduras (g)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.fat}
                      onChange={(event) =>
                        setForm({ ...form, fat: event.target.value })
                      }
                      className={fieldClass}
                    />
                  </label>
                </div>
                <p className="mt-2 text-[10px] text-[#87948b]">
                  Valores informativos do modelo; devem ser recalculados e
                  individualizados no plano do paciente.
                </p>
              </div>
              <label className="block">
                <span className={labelClass}>
                  Restrições ou marcadores (separados por vírgula)
                </span>
                <input
                  value={form.restrictions}
                  onChange={(event) =>
                    setForm({ ...form, restrictions: event.target.value })
                  }
                  placeholder="Ex.: sem leite, vegetariano"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Estrutura de refeições *</span>
                <span className="mb-2 block text-[10px] leading-4 text-[#87948b]">
                  Uma por linha no formato: Nome da refeição | horário |
                  alimentos separados por vírgula. Você poderá detalhar porções
                  na edição individual do plano.
                </span>
                <textarea
                  required
                  rows={5}
                  value={form.mealsText}
                  onChange={(event) =>
                    setForm({ ...form, mealsText: event.target.value })
                  }
                  className={`${fieldClass} font-mono text-[11px] leading-5`}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Status do modelo</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as FoodPlanTemplate['status'],
                    })
                  }
                  className={fieldClass}
                >
                  <option>Rascunho</option>
                  <option>Publicado</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  {modal === 'edit' ? 'Salvar alterações' : 'Salvar modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'details' && selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            className="my-auto max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span
                    className={`pill ${selected.status === 'Publicado' ? 'bg-[#e9f5ed] text-[#287653]' : 'bg-[#fff5e6] text-[#a8752c]'}`}
                  >
                    {selected.status}
                  </span>
                  <span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[10px] text-[#477653]">
                    {selected.goal}
                  </span>
                </div>
                <h2
                  id="details-title"
                  className="text-[20px] font-bold text-[#20352c]"
                >
                  {selected.name}
                </h2>
                <p className="mt-1 text-[11px] leading-5 text-[#87948b]">
                  {selected.description}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                aria-label="Fechar"
                className="p-2 text-[#87948b]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-[#f7faf7] p-3">
                <div className="text-[10px] text-[#87948b]">Energia</div>
                <div className="mt-1 text-[16px] font-bold text-[#304638]">
                  {selected.calories.toLocaleString('pt-BR')}{' '}
                  <span className="text-[10px] font-normal">kcal</span>
                </div>
              </div>
              <div className="rounded-xl bg-[#f7faf7] p-3">
                <div className="text-[10px] text-[#87948b]">Proteínas</div>
                <div className="mt-1 text-[16px] font-bold text-[#304638]">
                  {selected.protein} g
                </div>
              </div>
              <div className="rounded-xl bg-[#f7faf7] p-3">
                <div className="text-[10px] text-[#87948b]">Carboidratos</div>
                <div className="mt-1 text-[16px] font-bold text-[#304638]">
                  {selected.carbs} g
                </div>
              </div>
              <div className="rounded-xl bg-[#f7faf7] p-3">
                <div className="text-[10px] text-[#87948b]">Gorduras</div>
                <div className="mt-1 text-[16px] font-bold text-[#304638]">
                  {selected.fat} g
                </div>
              </div>
            </div>
            {selected.restrictions.length > 0 && (
              <div className="mt-4 rounded-lg bg-[#fff8ed] p-3 text-[11px] text-[#946a31]">
                Marcadores: {selected.restrictions.join(', ')}
              </div>
            )}
            <div className="mt-5">
              <h3 className="text-[13px] font-bold text-[#304638]">
                Estrutura de refeições
              </h3>
              <div className="mt-3 space-y-2">
                {selected.meals.map((meal, index) => (
                  <div
                    key={`${meal.name}-${index}`}
                    className="flex gap-3 rounded-xl border border-[#edf1ed] p-3"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e9f5ed] text-[#287653]">
                      <Utensils size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-[#304638]">
                          {meal.name}
                        </p>
                        <span className="flex items-center gap-1 text-[10px] text-[#87948b]">
                          <Clock3 size={12} />
                          {meal.time}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-[#718278]">
                        {meal.items.join(' · ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#edf1ed] pt-4 sm:flex-row sm:justify-between">
              <button
                onClick={() => duplicateTemplate(selected)}
                className="btn-secondary"
              >
                <Copy size={14} />
                Duplicar modelo
              </button>
              <div className="flex justify-end gap-2">
                <button
                  className="btn-secondary"
                  onClick={() => setModal(null)}
                >
                  Fechar
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setModal('assign')}
                >
                  <ArrowRight size={14} />
                  Usar modelo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === 'assign' && selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#17251d]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-title"
            className="my-auto w-full max-w-[500px] rounded-2xl border border-[#e8eee9] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7c8c81]">
                  CRIAR PLANO INDIVIDUAL
                </div>
                <h2
                  id="assign-title"
                  className="text-[20px] font-bold text-[#20352c]"
                >
                  Usar modelo
                </h2>
                <p className="mt-1 text-[11px] leading-5 text-[#87948b]">
                  O modelo será usado como ponto de partida. O plano individual
                  deverá ser revisado antes de ser finalizado.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                aria-label="Fechar"
                className="p-2 text-[#87948b]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mb-4 rounded-xl bg-[#f6faf6] p-3">
              <p className="text-[10px] text-[#87948b]">Modelo selecionado</p>
              <p className="mt-1 text-[12px] font-semibold text-[#304638]">
                {selected.name}
              </p>
              <p className="mt-1 text-[10px] text-[#718278]">
                {selected.calories.toLocaleString('pt-BR')} kcal de referência ·{' '}
                {selected.meals.length} refeições
              </p>
            </div>
            <form onSubmit={assignTemplate} className="space-y-4">
              <label className="block">
                <span className={labelClass}>Paciente *</span>
                <input
                  required
                  value={patientSearch}
                  onChange={(event) => {
                    setPatientSearch(event.target.value);
                    setPatient(event.target.value);
                  }}
                  placeholder="Buscar paciente por nome..."
                  className={fieldClass}
                />
                <span className="mt-1.5 block text-[10px] text-[#87948b]">
                  Demonstração: digite o nome do paciente que receberá uma cópia
                  individual.
                </span>
              </label>
              <div className="flex items-start gap-2 rounded-lg border border-[#f0dfc3] bg-[#fff9ef] p-3">
                <CircleAlert
                  size={15}
                  className="mt-0.5 shrink-0 text-[#b17a31]"
                />
                <p className="text-[10px] leading-4 text-[#8b6a39]">
                  Antes de concluir no sistema real, confira alergias,
                  restrições, porções e metas nutricionais no prontuário. O
                  modelo original não deve ser alterado.
                </p>
              </div>
              <div className="flex justify-end gap-2 border-t border-[#edf1ed] pt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Users size={14} />
                  Preparar plano individual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
