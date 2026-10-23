'use client';

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Copy,
  Dumbbell,
  Flame,
  HeartPulse,
  Mail,
  Pencil,
  Plus,
  Printer,
  Search,
  ShieldAlert,
  Target,
  Trash2,
  Utensils,
  Weight,
  X,
  Users,
  Pill,
  Ruler,
  Save,
  Info,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useHeaderStore } from '../../../stores/header-store';
import { toast } from 'sonner';
import { useModalStore } from '../../../stores/modal-store';
import { apiRequest } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth-store';
import { getInitials } from '../../../utils/name';

type Tab = 'Resumo' | 'Anamnese' | 'Antropometria' | 'Plano alimentar';
interface Food {
  id: number;
  name: string;
  amount: number;
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
  substitutes: {
    name: string;
    amount: number;
    kcal100: number;
    protein100: number;
    carbs100: number;
    fat100: number;
  }[];
}
interface Meal {
  id: number;
  name: string;
  time: string;
  foods: Food[];
}

const foodCatalog = [
  {
    name: 'Ovo mexido',
    kcal100: 166,
    protein100: 11,
    carbs100: 1.2,
    fat100: 12,
  },
  {
    name: 'Pão integral',
    kcal100: 253,
    protein100: 9.4,
    carbs100: 49,
    fat100: 3.7,
  },
  { name: 'Banana', kcal100: 89, protein100: 1.1, carbs100: 22.8, fat100: 0.3 },
  {
    name: 'Aveia em flocos',
    kcal100: 394,
    protein100: 13.9,
    carbs100: 66.6,
    fat100: 8.5,
  },
  {
    name: 'Arroz cozido',
    kcal100: 128,
    protein100: 2.5,
    carbs100: 28.1,
    fat100: 0.2,
  },
  {
    name: 'Feijão cozido',
    kcal100: 76,
    protein100: 4.8,
    carbs100: 13.6,
    fat100: 0.5,
  },
  {
    name: 'Peito de frango grelhado',
    kcal100: 159,
    protein100: 32,
    carbs100: 0,
    fat100: 2.5,
  },
  {
    name: 'Batata-doce cozida',
    kcal100: 77,
    protein100: 0.6,
    carbs100: 18.4,
    fat100: 0.1,
  },
  {
    name: 'Iogurte vegetal',
    kcal100: 65,
    protein100: 2.2,
    carbs100: 8,
    fat100: 2.5,
  },
  { name: 'Mamão', kcal100: 43, protein100: 0.5, carbs100: 10.8, fat100: 0.3 },
  { name: 'Tofu', kcal100: 76, protein100: 8.1, carbs100: 1.9, fat100: 4.8 },
  {
    name: 'Castanha-do-pará',
    kcal100: 659,
    protein100: 14.3,
    carbs100: 11.7,
    fat100: 67.1,
  },
];
const makeFood = (
  name: string,
  amount: number,
  kcal100: number,
  protein100: number,
  carbs100: number,
  fat100: number,
  id: number,
): Food => ({
  id,
  name,
  amount,
  kcal100,
  protein100,
  carbs100,
  fat100,
  substitutes: [],
});
const initialMeals: Meal[] = [
  {
    id: 1,
    name: 'Café da manhã',
    time: '07:00',
    foods: [
      makeFood('Ovo mexido', 100, 166, 11, 1.2, 12, 1),
      makeFood('Pão integral', 60, 253, 9.4, 49, 3.7, 2),
      makeFood('Banana', 80, 89, 1.1, 22.8, 0.3, 3),
    ],
  },
  {
    id: 2,
    name: 'Almoço',
    time: '12:30',
    foods: [
      makeFood('Arroz cozido', 130, 128, 2.5, 28.1, 0.2, 4),
      makeFood('Feijão cozido', 100, 76, 4.8, 13.6, 0.5, 5),
      makeFood('Peito de frango grelhado', 130, 159, 32, 0, 2.5, 6),
    ],
  },
  {
    id: 3,
    name: 'Lanche da tarde',
    time: '16:00',
    foods: [
      makeFood('Iogurte vegetal', 170, 65, 2.2, 8, 2.5, 7),
      makeFood('Aveia em flocos', 25, 394, 13.9, 66.6, 8.5, 8),
    ],
  },
  {
    id: 4,
    name: 'Jantar',
    time: '19:30',
    foods: [
      makeFood('Batata-doce cozida', 180, 77, 0.6, 18.4, 0.1, 9),
      makeFood('Peito de frango grelhado', 120, 159, 32, 0, 2.5, 10),
    ],
  },
];
const fmt = (value: number, digits = 0) =>
  value.toLocaleString('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
const nutrition = (foods: Food[]) =>
  foods.reduce(
    (total, food) => ({
      kcal: total.kcal + (food.kcal100 * food.amount) / 100,
      protein: total.protein + (food.protein100 * food.amount) / 100,
      carbs: total.carbs + (food.carbs100 * food.amount) / 100,
      fat: total.fat + (food.fat100 * food.amount) / 100,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

export default function PatientDetailPage() {
  const [tab, setTab] = useState<Tab>('Resumo');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(false);
  const [showAddFood, setShowAddFood] = useState<number | null>(null);
  const [foodQuery, setFoodQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(foodCatalog[0]?.name);
  const [selectedAmount, setSelectedAmount] = useState('100');
  const [showSubstitutes, setShowSubstitutes] = useState<{
    mealId: number;
    foodId: number;
  } | null>(null);
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [newMealName, setNewMealName] = useState('Nova refeição');
  const [newMealTime, setNewMealTime] = useState('20:30');
  const [showNewMeal, setShowNewMeal] = useState(false);
  const [macroCarbs, setMacroCarbs] = useState(50);
  const [macroProtein, setMacroProtein] = useState(30);
  const [macroFat, setMacroFat] = useState(20);
  const [targetCalories, setTargetCalories] = useState(2450);
  const [targetMethod, setTargetMethod] = useState('Harris-Benedict');
  const [activity, setActivity] = useState('Moderadamente ativo');
  const [sport, setSport] = useState('Musculação');
  const [frequency, setFrequency] = useState('4 vezes por semana');
  const [allergies, setAllergies] = useState(['Leite e derivados']);
  const [newAllergy, setNewAllergy] = useState('');
  const [medications, setMedications] = useState(
    'Nenhum medicamento informado.',
  );
  const [precautions, setPrecautions] = useState(
    'Investigar desconforto gastrointestinal em consultas de retorno.',
  );
  const [weight, setWeight] = useState(68.4);
  const [height, setHeight] = useState(172);
  const [waist, setWaist] = useState(82);
  const [hip, setHip] = useState(96);
  const [neck, setNeck] = useState(35);
  const [bodyFat, setBodyFat] = useState(22.4);
  const [skinfolds, setSkinfolds] = useState({
    triceps: 14,
    biceps: 7,
    subscapular: 16,
    suprailiac: 18,
    abdominal: 20,
    thigh: 22,
    calf: 13,
  });
  const [boneDiameter, setBoneDiameter] = useState({ wrist: 5.8, femur: 9.4 });

  const setConfig = useHeaderStore((state) => state.setConfig);
  const reset = useHeaderStore((state) => state.reset);

  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setConfig({
      title: "Ficha do paciente",
      actions: (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditing(!editing);
              notify(
                editing
                  ? 'Edição finalizada nesta demonstração.'
                  : 'Campos editáveis habilitados nesta demonstração.',
              );
            }}
            className="btn-secondary"
          >
            <Pencil size={14} />
            {editing ? 'Concluir edição' : 'Editar cadastro'}
          </button>
          <button onClick={printPlan} className="btn-primary">
            <Printer size={15} />
            Imprimir plano
          </button>
        </div>
      )
    });

    return reset;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConfig, reset]);

  const total = useMemo(
    () => nutrition(meals.flatMap((meal) => meal.foods)),
    [meals],
  );
  const bmi = weight / Math.pow(height / 100, 2);
  const waistHeightRatio = waist / height;
  const macroSum = macroCarbs + macroProtein + macroFat;
  const targetMacros = {
    carbs: (targetCalories * macroCarbs) / 100 / 4,
    protein: (targetCalories * macroProtein) / 100 / 4,
    fat: (targetCalories * macroFat) / 100 / 9,
  };
  const activityFactor =
    activity === 'Sedentário'
      ? 1.2
      : activity === 'Levemente ativo'
        ? 1.375
        : activity === 'Moderadamente ativo'
          ? 1.55
          : activity === 'Muito ativo'
            ? 1.725
            : 1.9;
  const basalEnergy =
    targetMethod === 'Mifflin-St Jeor'
      ? 10 * weight + 6.25 * height - 5 * 29 - 161
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * 29;
  const estimatedEnergy = basalEnergy * activityFactor;
  const mealTotals = useMemo(
    () => meals.map((meal) => ({ ...meal, total: nutrition(meal.foods) })),
    [meals],
  );
  const filteredFoods = foodCatalog.filter((food) =>
    food.name
      .toLocaleLowerCase('pt-BR')
      .includes(foodQuery.toLocaleLowerCase('pt-BR')),
  );

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  }
  function addFood(mealId: number) {
    const catalogFood = foodCatalog.find((food) => food.name === selectedFood);
    if (!catalogFood) return;
    const food = makeFood(
      catalogFood.name,
      Math.max(1, Number(selectedAmount) || 100),
      catalogFood.kcal100,
      catalogFood.protein100,
      catalogFood.carbs100,
      catalogFood.fat100,
      Date.now(),
    );
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, food] } : meal,
      ),
    );
    setShowAddFood(null);
    setFoodQuery('');
    setSelectedAmount('100');
    notify(`${food.name} adicionado à refeição.`);
  }
  function updateFoodAmount(mealId: number, foodId: number, amount: number) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id !== mealId
          ? meal
          : {
              ...meal,
              foods: meal.foods.map((food) =>
                food.id === foodId
                  ? { ...food, amount: Math.max(0, amount) }
                  : food,
              ),
            },
      ),
    );
  }
  function removeFood(mealId: number, foodId: number) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
          : meal,
      ),
    );
  }
  function addSubstitute(mealId: number, foodId: number, name: string) {
    const source = foodCatalog.find((food) => food.name === name);
    if (!source) return;
    setMeals((current) =>
      current.map((meal) =>
        meal.id !== mealId
          ? meal
          : {
              ...meal,
              foods: meal.foods.map((food) => {
                if (food.id !== foodId) return food;
                const kcalDiff =
                  Math.abs(source.kcal100 - food.kcal100) /
                  Math.max(food.kcal100, 1);
                const proteinDiff =
                  Math.abs(source.protein100 - food.protein100) /
                  Math.max(food.protein100, 1);
                const carbsDiff =
                  Math.abs(source.carbs100 - food.carbs100) /
                  Math.max(food.carbs100, 1);
                const fatDiff =
                  Math.abs(source.fat100 - food.fat100) /
                  Math.max(food.fat100, 1);
                const compatible = [kcalDiff, proteinDiff, carbsDiff, fatDiff]
                  .filter(Number.isFinite)
                  .every((diff) => diff <= 0.2);
                return {
                  ...food,
                  substitutes: [
                    ...food.substitutes,
                    {
                      name: source.name,
                      amount: food.amount,
                      kcal100: source.kcal100,
                      protein100: source.protein100,
                      carbs100: source.carbs100,
                      fat100: source.fat100,
                      compatible,
                    } as Food['substitutes'][number],
                  ],
                };
              }),
            },
      ),
    );
    setShowSubstitutes(null);
    notify('Substituto adicionado para comparação nutricional.');
  }
  function createMeal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newMealName.trim()) return;
    setMeals((current) =>
      [
        ...current,
        {
          id: Date.now(),
          name: newMealName.trim(),
          time: newMealTime,
          foods: [],
        },
      ].sort((a, b) => a.time.localeCompare(b.time)),
    );
    setShowNewMeal(false);
    setNewMealName('Nova refeição');
    notify(
      'Refeição criada. Adicione os alimentos para calcular os valores nutricionais.',
    );
  }
  function printPlan() {
    window.print();
  }
  function emailPlan() {
    notify(
      'Prévia de envio: conecte o serviço de e-mail para enviar o plano ao paciente.',
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-[#24352b]">
      <main className="main">
        <div className="content">
          <div className="mb-5 flex items-center gap-2 text-[11px] text-[#819087] print:hidden">
            <Link href="/pacientes" className="hover:text-[#287653]">
              Pacientes
            </Link>
            <ChevronRight size={13} />
            <span className="text-[#3e5547]">Mariana Costa</span>
          </div>
          <section className="panel p-4 mb-5 overflow-hidden">
            <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#e0eee2] text-[18px] font-bold text-[#36734f]">
                  MC
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h1 className="text-[22px] font-bold tracking-[-.7px]">
                      Mariana Costa
                    </h1>
                    <span className="pill pill-success">Paciente ativa</span>
                    <span className="pill">Particular</span>
                  </div>
                  <p className="text-[12px] text-[#7c8b81]">
                    29 anos · Feminino · Desde 12 mar, 2026 · ID PAC-00124
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#65766b]">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} />
                      mariana.costa@email.com
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-semibold">☎</span>(91) 98812-3401
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      Próxima consulta: 23 out, 09:00
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button className="btn-secondary" onClick={emailPlan}>
                  <Mail size={14} />
                  Enviar por e-mail
                </button>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    notify('Histórico de consultas aberto nesta demonstração.')
                  }
                >
                  <Clock3 size={14} />
                  Histórico
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-[#edf1ed] md:grid-cols-4">
              <div className="border-b border-r border-[#edf1ed] p-4 md:border-b-0">
                <div className="text-[10px] text-[#87948b]">Objetivo atual</div>
                <div className="mt-1 text-[13px] font-bold">Ganho de massa</div>
                <div className="mt-1 text-[10px] text-[#7c8b81]">
                  Revisado em 16 out
                </div>
              </div>
              <div className="border-b border-[#edf1ed] p-4 md:border-b-0 md:border-r">
                <div className="text-[10px] text-[#87948b]">Plano vigente</div>
                <div className="mt-1 text-[13px] font-bold">
                  Hipertrofia · v2
                </div>
                <div className="mt-1 text-[10px] text-[#287653]">
                  Em acompanhamento
                </div>
              </div>
              <div className="border-r border-[#edf1ed] p-4">
                <div className="text-[10px] text-[#87948b]">
                  Última avaliação
                </div>
                <div className="mt-1 text-[13px] font-bold">16 out, 2026</div>
                <div className="mt-1 text-[10px] text-[#7c8b81]">Há 3 dias</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] text-[#87948b]">
                  Alertas clínicos
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-[#a35c35]">
                  <AlertTriangle size={14} />
                  Alergia a leite
                </div>
                <div className="mt-1 text-[10px] text-[#7c8b81]">
                  Considerar em todas as refeições
                </div>
              </div>
            </div>
          </section>

          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e4ebe5] print:hidden">
            {(
              [
                'Resumo',
                'Anamnese',
                'Antropometria',
                'Plano alimentar',
              ] as Tab[]
            ).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-[12px] font-semibold transition ${tab === item ? 'border-[#39835b] text-[#287653]' : 'border-transparent text-[#849188] hover:text-[#3e5547]'}`}
              >
                {item === 'Plano alimentar' && (
                  <Utensils size={14} className="mr-1.5 inline" />
                )}
                {item === 'Antropometria' && (
                  <Ruler size={14} className="mr-1.5 inline" />
                )}
                {item}
              </button>
            ))}
          </div>

          {tab === 'Resumo' && (
            <>
              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={Weight}
                  label="Peso atual"
                  value={`${fmt(weight, 1)} kg`}
                  detail="−0,8 kg desde a última avaliação"
                  trend="down"
                />
                <Metric
                  icon={Activity}
                  label="IMC"
                  value={fmt(bmi, 1)}
                  detail="Faixa de referência: 18,5–24,9"
                  trend="neutral"
                />
                <Metric
                  icon={Flame}
                  label="Gasto energético estimado"
                  value={`${fmt(targetCalories)} kcal`}
                  detail="Meta diária atual do plano"
                  trend="neutral"
                />
                <Metric
                  icon={HeartPulse}
                  label="Relação cintura/altura"
                  value={fmt(waistHeightRatio, 2)}
                  detail={
                    waistHeightRatio < 0.5
                      ? 'Abaixo do ponto de atenção de 0,50'
                      : 'Requer avaliação contextual'
                  }
                  trend={waistHeightRatio < 0.5 ? 'good' : 'warning'}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_.85fr]">
                <section className="panel p-4">
                  <div className="section-title">
                    Acompanhamento nutricional
                  </div>
                  <div className="section-subtitle">
                    Evolução entre avaliações registradas
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-[#f6f9f6] p-3">
                      <div className="text-[10px] text-[#819087]">
                        Peso inicial
                      </div>
                      <div className="mt-1 text-[18px] font-bold">
                        71,2{' '}
                        <span className="text-[10px] font-medium text-[#819087]">
                          kg
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#f6f9f6] p-3">
                      <div className="text-[10px] text-[#819087]">
                        Peso atual
                      </div>
                      <div className="mt-1 text-[18px] font-bold">
                        {fmt(weight, 1)}{' '}
                        <span className="text-[10px] font-medium text-[#819087]">
                          kg
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#eef7ef] p-3">
                      <div className="text-[10px] text-[#598166]">
                        Variação total
                      </div>
                      <div className="mt-1 text-[18px] font-bold text-[#287653]">
                        −{fmt(71.2 - weight, 1)}{' '}
                        <span className="text-[10px] font-medium">kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    <Progress
                      label="Meta de proteína diária"
                      value={total.protein}
                      target={targetMacros.protein}
                      unit="g"
                    />
                    <Progress
                      label="Meta de carboidratos"
                      value={total.carbs}
                      target={targetMacros.carbs}
                      unit="g"
                    />
                    <Progress
                      label="Meta de lipídios"
                      value={total.fat}
                      target={targetMacros.fat}
                      unit="g"
                    />
                  </div>
                  <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#e6eee7] bg-[#fbfdfb] p-3 text-[10px] leading-5 text-[#7b8a80]">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    Valores do plano são estimativas demonstrativas. A adequação
                    nutricional deve ser revisada pelo profissional antes de
                    prescrever.
                  </p>
                </section>
                <div className="space-y-5">
                  <section className="panel p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="section-title">Resumo clínico</div>
                        <div className="section-subtitle">
                          Informações importantes para a consulta
                        </div>
                      </div>
                      <ShieldAlert size={18} className="text-[#a35c35]" />
                    </div>
                    <div className="space-y-3">
                      <InfoRow
                        icon={AlertTriangle}
                        title="Alergias e intolerâncias"
                        text={allergies.join(', ') || 'Nenhuma informada'}
                        alert={allergies.length > 0}
                      />
                      <InfoRow
                        icon={Pill}
                        title="Medicamentos"
                        text={medications}
                      />
                      <InfoRow
                        icon={Activity}
                        title="Atividade física"
                        text={`${activity} · ${sport}, ${frequency.toLowerCase()}`}
                      />
                      <InfoRow
                        icon={ClipboardList}
                        title="Precauções"
                        text={precautions}
                      />
                    </div>
                    <button
                      onClick={() => setTab('Anamnese')}
                      className="mt-4 text-[11px] font-bold text-[#287653]"
                    >
                      Ver anamnese completa →
                    </button>
                  </section>
                  <section className="panel p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="section-title">Próximos passos</div>
                        <div className="section-subtitle">
                          Para manter o acompanhamento em dia
                        </div>
                      </div>
                      <Sparkles size={17} className="text-[#6a9b78]" />
                    </div>
                    <div className="space-y-3">
                      <Task
                        title="Revisar tolerância ao plano"
                        detail="Próxima consulta · 23 out"
                      />
                      <Task
                        title="Atualizar medidas corporais"
                        detail="Última avaliação · 16 out"
                      />
                      <Task
                        title="Confirmar evolução do treino"
                        detail="Acompanhar frequência semanal"
                      />
                    </div>
                    <button
                      onClick={() =>
                        notify('Lembrete criado nesta demonstração.')
                      }
                      className="btn-secondary mt-4 w-full justify-center"
                    >
                      <Plus size={14} />
                      Adicionar lembrete
                    </button>
                  </section>
                </div>
              </div>
            </>
          )}

          {tab === 'Anamnese' && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
              <section className="panel p-4">
                <SectionHeading
                  icon={Users}
                  title="Dados pessoais"
                  description="Identificação e informações para o atendimento"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Nome completo"
                    value="Mariana Costa"
                    editable={editing}
                  />
                  <Field
                    label="Data de nascimento"
                    value="14/06/1997"
                    editable={editing}
                  />
                  <Field
                    label="Sexo biológico (para fórmulas)"
                    value="Feminino"
                    editable={editing}
                  />
                  <Field
                    label="E-mail"
                    value="mariana.costa@email.com"
                    editable={editing}
                  />
                  <Field
                    label="Telefone"
                    value="(91) 98812-3401"
                    editable={editing}
                  />
                  <Field
                    label="Profissão"
                    value="Analista de sistemas"
                    editable={editing}
                  />
                  <Field
                    label="Objetivo principal"
                    value="Ganho de massa muscular"
                    editable={editing}
                  />
                  <Field
                    label="Rotina de trabalho"
                    value="Predominantemente sentada"
                    editable={editing}
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                    Preferências alimentares e rotina
                  </label>
                  <textarea
                    disabled={!editing}
                    defaultValue="Prefere refeições simples e rápidas durante a semana. Costuma treinar no fim da tarde."
                    className="min-h-24 w-full rounded-lg border border-[#e2e9e3] bg-white p-3 text-[12px] outline-none focus:border-[#72a883] disabled:bg-[#f8faf8]"
                  />
                </div>
              </section>
              <div className="space-y-5">
                <section className="panel p-4">
                  <SectionHeading
                    icon={Dumbbell}
                    title="Atividade física e estilo de vida"
                    description="Dados usados para estimar o gasto energético"
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                        Nível de atividade geral
                      </label>
                      <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="form-control"
                      >
                        <option>Sedentário</option>
                        <option>Levemente ativo</option>
                        <option>Moderadamente ativo</option>
                        <option>Muito ativo</option>
                        <option>Extremamente ativo</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                          Esporte / atividade
                        </label>
                        <select
                          value={sport}
                          onChange={(e) => setSport(e.target.value)}
                          className="form-control"
                        >
                          <option>Nenhuma</option>
                          <option>Musculação</option>
                          <option>Corrida</option>
                          <option>Natação</option>
                          <option>Ciclismo</option>
                          <option>Cross training</option>
                          <option>Pilates</option>
                          <option>Yoga</option>
                          <option>Esporte coletivo</option>
                          <option>Outra atividade</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                          Frequência semanal
                        </label>
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          className="form-control"
                        >
                          <option>Não pratica</option>
                          <option>1 vez por semana</option>
                          <option>2 vezes por semana</option>
                          <option>3 vezes por semana</option>
                          <option>4 vezes por semana</option>
                          <option>5 vezes por semana</option>
                          <option>6 vezes por semana</option>
                          <option>Todos os dias</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Duração média (min)"
                        value="60"
                        editable={editing}
                      />
                      <Field
                        label="Tempo sentado / dia"
                        value="8 horas"
                        editable={editing}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                        Sono e hidratação
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Sono médio"
                          value="7 h/noite"
                          editable={editing}
                        />
                        <Field
                          label="Água por dia"
                          value="2,0 L"
                          editable={editing}
                        />
                      </div>
                    </div>
                  </div>
                </section>
                <section className="panel p-4">
                  <SectionHeading
                    icon={ShieldAlert}
                    title="Alergias, medicamentos e precauções"
                    description="Informações críticas que devem acompanhar o plano"
                  />
                  <div className="mb-4 rounded-lg border border-[#f1dfc7] bg-[#fffaf3] p-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#9a5b28]">
                      <AlertTriangle size={14} />
                      Alergias registradas
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {allergies.map((allergy) => (
                        <span
                          key={allergy}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#9a5b28] ring-1 ring-[#f0d9ba]"
                        >
                          {allergy}
                          <button
                            onClick={() =>
                              setAllergies((current) =>
                                current.filter((item) => item !== allergy),
                              )
                            }
                            aria-label={`Remover ${allergy}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="Adicionar alergia ou intolerância"
                        className="form-control flex-1"
                      />
                      <button
                        onClick={() => {
                          if (newAllergy.trim()) {
                            setAllergies((current) => [
                              ...current,
                              newAllergy.trim(),
                            ]);
                            setNewAllergy('');
                          }
                        }}
                        className="btn-secondary"
                      >
                        <Plus size={13} />
                        Adicionar
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                      Medicamentos em uso
                    </label>
                    <textarea
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      className="min-h-20 w-full rounded-lg border border-[#e2e9e3] bg-white p-3 text-[12px] outline-none focus:border-[#72a883]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                      Precauções e observações clínicas
                    </label>
                    <textarea
                      value={precautions}
                      onChange={(e) => setPrecautions(e.target.value)}
                      className="min-h-20 w-full rounded-lg border border-[#e2e9e3] bg-white p-3 text-[12px] outline-none focus:border-[#72a883]"
                    />
                  </div>
                  <p className="mt-3 text-[10px] leading-5 text-[#89968d]">
                    Inclua apenas informações relevantes ao cuidado nutricional.
                    Confirme medicamentos, alergias e restrições com o paciente
                    em cada revisão.
                  </p>
                </section>
              </div>
            </div>
          )}

          {tab === 'Antropometria' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={Weight}
                  label="Peso"
                  value={`${fmt(weight, 1)} kg`}
                  detail="Última medição"
                  trend="neutral"
                />
                <Metric
                  icon={Ruler}
                  label="Altura"
                  value={`${fmt(height)} cm`}
                  detail="Altura registrada"
                  trend="neutral"
                />
                <Metric
                  icon={Activity}
                  label="IMC calculado"
                  value={fmt(bmi, 1)}
                  detail={
                    bmi < 18.5
                      ? 'Baixo peso'
                      : bmi < 25
                        ? 'Faixa de referência'
                        : bmi < 30
                          ? 'Sobrepeso'
                          : 'Obesidade'
                  }
                  trend={bmi >= 18.5 && bmi < 25 ? 'good' : 'warning'}
                />
                <Metric
                  icon={HeartPulse}
                  label="Cintura / altura"
                  value={fmt(waistHeightRatio, 2)}
                  detail="Indicador de triagem, não diagnóstico"
                  trend={waistHeightRatio < 0.5 ? 'good' : 'warning'}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
                <section className="panel p-4">
                  <SectionHeading
                    icon={Ruler}
                    title="Medidas corporais"
                    description="Atualize os valores da avaliação antropométrica"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="Peso atual"
                      unit="kg"
                      value={weight}
                      onChange={setWeight}
                      step="0.1"
                    />
                    <NumberField
                      label="Altura"
                      unit="cm"
                      value={height}
                      onChange={setHeight}
                    />
                    <NumberField
                      label="Circunferência da cintura"
                      unit="cm"
                      value={waist}
                      onChange={setWaist}
                    />
                    <NumberField
                      label="Circunferência do quadril"
                      unit="cm"
                      value={hip}
                      onChange={setHip}
                    />
                    <NumberField
                      label="Circunferência do pescoço"
                      unit="cm"
                      value={neck}
                      onChange={setNeck}
                    />
                    <NumberField
                      label="Percentual de gordura estimado"
                      unit="%"
                      value={bodyFat}
                      onChange={setBodyFat}
                      step="0.1"
                    />
                  </div>
                  <div className="mt-5 rounded-xl bg-[#f6f9f6] p-4">
                    <div className="mb-3 text-[11px] font-bold">
                      Indicadores derivados
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Derived label="IMC" value={`${fmt(bmi, 1)} kg/m²`} />
                      <Derived
                        label="Cintura / altura"
                        value={fmt(waistHeightRatio, 2)}
                      />
                      <Derived
                        label="Cintura / quadril"
                        value={fmt(waist / Math.max(hip, 1), 2)}
                      />
                      <Derived
                        label="Massa de gordura estimada"
                        value={`${fmt((weight * bodyFat) / 100, 1)} kg`}
                      />
                    </div>
                    <p className="mt-3 text-[10px] leading-5 text-[#849188]">
                      Os indicadores são estimativas de apoio. A interpretação
                      clínica depende de idade, sexo, histórico, método de
                      medida e diretrizes profissionais.
                    </p>
                  </div>
                </section>

                <div className="space-y-5">
                  <section className="panel p-4">
                    <SectionHeading
                      icon={Activity}
                      title="Dobras cutâneas"
                      description="Registre cada ponto em milímetros"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(skinfolds).map(([key, value]) => (
                        <NumberField
                          key={key}
                          label={
                            key === 'triceps'
                              ? 'Tricipital'
                              : key === 'biceps'
                                ? 'Bicipital'
                                : key === 'subscapular'
                                  ? 'Subescapular'
                                  : key === 'suprailiac'
                                    ? 'Supra-ilíaca'
                                    : key === 'abdominal'
                                      ? 'Abdominal'
                                      : key === 'thigh'
                                        ? 'Coxa'
                                        : 'Panturrilha'
                          }
                          unit="mm"
                          value={value}
                          onChange={(next) =>
                            setSkinfolds((current) => ({
                              ...current,
                              [key]: next,
                            }))
                          }
                        />
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-[#e8eee8] p-3">
                      <span className="text-[11px] text-[#78877d]">
                        Soma das dobras registradas
                      </span>
                      <span className="text-[13px] font-bold">
                        {fmt(
                          Object.values(skinfolds).reduce(
                            (sum, value) => sum + value,
                            0,
                          ),
                        )}{' '}
                        mm
                      </span>
                    </div>
                  </section>

                  <section className="panel p-4">
                    <SectionHeading
                      icon={Ruler}
                      title="Diâmetros ósseos"
                      description="Para avaliação de composição e estrutura corporal"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label="Punho / biestilóide"
                        unit="cm"
                        value={boneDiameter.wrist}
                        onChange={(value) =>
                          setBoneDiameter((current) => ({
                            ...current,
                            wrist: value,
                          }))
                        }
                        step="0.1"
                      />
                      <NumberField
                        label="Fêmur / biepicondilar"
                        unit="cm"
                        value={boneDiameter.femur}
                        onChange={(value) =>
                          setBoneDiameter((current) => ({
                            ...current,
                            femur: value,
                          }))
                        }
                        step="0.1"
                      />
                    </div>
                  </section>

                  <section className="rounded-xl border border-[#e3ece4] bg-[#f2f8f3] p-4">
                    <div className="flex gap-2">
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-[#4b8961]"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-[#38664a]">
                          Risco cardiovascular
                        </div>
                        <p className="mt-1 text-[10px] leading-5 text-[#6f8274]">
                          Circunferência da cintura e relação cintura/altura
                          podem apoiar a triagem de risco cardiometabólico. Não
                          classifique risco individual apenas com esses dados;
                          considere referências adequadas à população e
                          avaliação clínica.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <div className="flex justify-end print:hidden">
                <button
                  onClick={() =>
                    notify('Avaliação antropométrica salva nesta demonstração.')
                  }
                  className="btn-primary"
                >
                  <Save size={14} />
                  Salvar avaliação
                </button>
              </div>
            </div>
          )}

          {tab === 'Plano alimentar' && (
            <div className="space-y-5">
              <section className="panel p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Utensils size={17} className="text-[#39835b]" />
                      <h2 className="text-[15px] font-bold">
                        Plano alimentar individual
                      </h2>
                      <span className="pill pill-success">
                        Rascunho editável
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#849188]">
                      Personalizado para Mariana Costa · baseado na avaliação de
                      16 out, 2026
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        notify(
                          'Selecione um modelo na seção Planos alimentares para aplicar como ponto de partida.',
                        )
                      }
                    >
                      <Copy size={14} />
                      Usar modelo
                    </button>
                    <button className="btn-secondary" onClick={emailPlan}>
                      <Mail size={14} />
                      Enviar por e-mail
                    </button>
                    <button className="btn-primary" onClick={printPlan}>
                      <Printer size={14} />
                      Imprimir / PDF
                    </button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-[#f6f9f6] p-3">
                    <div className="text-[10px] text-[#849188]">
                      Meta energética
                    </div>
                    <div className="mt-1 text-[18px] font-bold">
                      {fmt(targetCalories)}{' '}
                      <span className="text-[10px] font-medium">kcal</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f9f6] p-3">
                    <div className="text-[10px] text-[#849188]">
                      Energia distribuída
                    </div>
                    <div className="mt-1 text-[18px] font-bold">
                      {fmt(total.kcal)}{' '}
                      <span className="text-[10px] font-medium">kcal</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f9f6] p-3">
                    <div className="text-[10px] text-[#849188]">Refeições</div>
                    <div className="mt-1 text-[18px] font-bold">
                      {meals.length}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fff8ee] p-3">
                    <div className="text-[10px] text-[#a0784c]">
                      Diferença energética
                    </div>
                    <div
                      className={`mt-1 text-[18px] font-bold ${Math.abs(total.kcal - targetCalories) / targetCalories <= 0.1 ? 'text-[#287653]' : 'text-[#a35c35]'}`}
                    >
                      {total.kcal - targetCalories > 0 ? '+' : ''}
                      {fmt(total.kcal - targetCalories)}{' '}
                      <span className="text-[10px] font-medium">kcal</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Progress
                    label={`Carboidratos · ${macroCarbs}%`}
                    value={total.carbs}
                    target={targetMacros.carbs}
                    unit="g"
                  />
                  <Progress
                    label={`Proteínas · ${macroProtein}%`}
                    value={total.protein}
                    target={targetMacros.protein}
                    unit="g"
                  />
                  <Progress
                    label={`Lipídios · ${macroFat}%`}
                    value={total.fat}
                    target={targetMacros.fat}
                    unit="g"
                  />
                </div>
              </section>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[.8fr_1.2fr]">
                <section className="panel p-4 h-fit">
                  <SectionHeading
                    icon={Target}
                    title="Necessidade energética e macros"
                    description="Defina a meta diária e a distribuição dos macronutrientes"
                  />
                  <div className="mb-4">
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                      Método de estimativa energética
                    </label>
                    <select
                      value={targetMethod}
                      onChange={(e) => setTargetMethod(e.target.value)}
                      className="form-control"
                    >
                      <option>Harris-Benedict</option>
                      <option>Mifflin-St Jeor</option>
                      <option>Meta definida pelo profissional</option>
                    </select>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <NumberField
                      label="Meta energética"
                      unit="kcal/dia"
                      value={targetCalories}
                      onChange={setTargetCalories}
                    />
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                        Nível de atividade
                      </label>
                      <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="form-control"
                      >
                        <option>Sedentário</option>
                        <option>Levemente ativo</option>
                        <option>Moderadamente ativo</option>
                        <option>Muito ativo</option>
                        <option>Extremamente ativo</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4 rounded-xl border border-[#e4ece5] bg-[#f8fbf8] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-[#849188]">
                          Estimativa pela fórmula selecionada · fator{' '}
                          {fmt(activityFactor, 3)}
                        </div>
                        <div className="mt-1 text-[12px] font-semibold">
                          Metabolismo basal: {fmt(basalEnergy)} kcal/dia
                        </div>
                        <div className="mt-1 text-[12px] font-bold text-[#287653]">
                          Gasto diário estimado: {fmt(estimatedEnergy)} kcal
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTargetCalories(Math.round(estimatedEnergy))
                        }
                        className="btn-secondary"
                      >
                        Aplicar estimativa
                      </button>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold">
                      Distribuição de energia
                    </span>
                    <span
                      className={`text-[11px] font-bold ${macroSum === 100 ? 'text-[#287653]' : 'text-[#b45309]'}`}
                    >
                      {macroSum}%{' '}
                      {macroSum === 100
                        ? '· equilibrado'
                        : '· deve totalizar 100%'}
                    </span>
                  </div>
                  <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-[#edf1ed]">
                    <div
                      className="bg-[#4d966b]"
                      style={{
                        width: `${(macroCarbs / Math.max(macroSum, 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#e0ae61]"
                      style={{
                        width: `${(macroProtein / Math.max(macroSum, 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#6c9db7]"
                      style={{
                        width: `${(macroFat / Math.max(macroSum, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <MacroSlider
                      label="Carboidratos"
                      value={macroCarbs}
                      color="text-[#39835b]"
                      onChange={setMacroCarbs}
                    />
                    <MacroSlider
                      label="Proteínas"
                      value={macroProtein}
                      color="text-[#b78134]"
                      onChange={setMacroProtein}
                    />
                    <MacroSlider
                      label="Lipídios"
                      value={macroFat}
                      color="text-[#477f9c]"
                      onChange={setMacroFat}
                    />
                  </div>
                  <div className="mt-5 space-y-2">
                    <MacroResult
                      label="Carboidratos"
                      percent={macroCarbs}
                      grams={targetMacros.carbs}
                      kcal={(targetCalories * macroCarbs) / 100}
                      color="bg-[#4d966b]"
                    />
                    <MacroResult
                      label="Proteínas"
                      percent={macroProtein}
                      grams={targetMacros.protein}
                      kcal={(targetCalories * macroProtein) / 100}
                      color="bg-[#e0ae61]"
                    />
                    <MacroResult
                      label="Lipídios"
                      percent={macroFat}
                      grams={targetMacros.fat}
                      kcal={(targetCalories * macroFat) / 100}
                      color="bg-[#6c9db7]"
                    />
                  </div>
                  <p className="mt-4 rounded-lg bg-[#f7f9f7] p-3 text-[10px] leading-5 text-[#819087]">
                    A estimativa depende de idade, sexo, peso, altura e fator de
                    atividade. Confirme a fórmula, o fator aplicado e a meta
                    energética antes de finalizar a prescrição.
                  </p>
                </section>
                <section className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-[15px] font-bold">
                        Refeições do dia
                      </h2>
                      <p className="mt-1 text-[11px] text-[#849188]">
                        Adicione refeições em qualquer horário e ajuste os
                        alimentos por porção.
                      </p>
                    </div>
                    <button
                      className="btn-primary print:hidden"
                      onClick={() => setShowNewMeal(true)}
                    >
                      <Plus size={14} />
                      Nova refeição
                    </button>
                  </div>
                  {mealTotals.map((meal) => (
                    <div key={meal.id} className="panel p-4 overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] bg-[#fbfdfb] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f2e9] text-[#39835b]">
                            <Utensils size={16} />
                          </div>
                          <div>
                            <div className="text-[12px] font-bold">
                              {meal.name}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#849188]">
                              <Clock3 size={11} />
                              {meal.time} · {meal.foods.length} alimentos
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[13px] font-bold">
                              {fmt(meal.total.kcal)} kcal
                            </div>
                            <div className="text-[10px] text-[#849188]">
                              P {fmt(meal.total.protein, 1)}g · C{' '}
                              {fmt(meal.total.carbs, 1)}g · L{' '}
                              {fmt(meal.total.fat, 1)}g
                            </div>
                          </div>
                          <button
                            aria-label="Remover refeição"
                            onClick={() => {
                              setMeals((current) =>
                                current.filter((item) => item.id !== meal.id),
                              );
                              notify('Refeição removida.');
                            }}
                            className="rounded-lg p-2 text-[#94a198] hover:bg-[#fbeeee] hover:text-[#b44b4b] print:hidden"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {meal.foods.map((food) => (
                            <div
                              key={food.id}
                              className="rounded-lg border border-[#edf1ed] p-3"
                            >
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] font-semibold">
                                    {food.name}
                                  </div>
                                  <div className="mt-1 text-[10px] text-[#849188]">
                                    {fmt((food.kcal100 * food.amount) / 100)}{' '}
                                    kcal · P{' '}
                                    {fmt(
                                      (food.protein100 * food.amount) / 100,
                                      1,
                                    )}
                                    g · C{' '}
                                    {fmt(
                                      (food.carbs100 * food.amount) / 100,
                                      1,
                                    )}
                                    g · L{' '}
                                    {fmt((food.fat100 * food.amount) / 100, 1)}g
                                  </div>
                                </div>
                                <label className="flex items-center gap-1 text-[10px] text-[#849188]">
                                  Porção{' '}
                                  <input
                                    aria-label={`Porção de ${food.name} em gramas`}
                                    type="number"
                                    min="0"
                                    value={food.amount}
                                    onChange={(e) =>
                                      updateFoodAmount(
                                        meal.id,
                                        food.id,
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-16 rounded-md border border-[#e1e9e2] px-2 py-1 text-[11px] text-[#324438] print:hidden"
                                  />
                                  <span className="hidden print:inline">
                                    {food.amount} g
                                  </span>
                                  <span>g</span>
                                </label>
                                <button
                                  className="rounded-md p-1.5 text-[#849188] hover:bg-[#eef5ef] hover:text-[#287653] print:hidden"
                                  onClick={() =>
                                    setShowSubstitutes(
                                      showSubstitutes?.foodId === food.id
                                        ? null
                                        : { mealId: meal.id, foodId: food.id },
                                    )
                                  }
                                  title="Adicionar substituto"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  className="rounded-md p-1.5 text-[#9b8e8e] hover:bg-[#fbeeee] hover:text-[#b44b4b] print:hidden"
                                  onClick={() => removeFood(meal.id, food.id)}
                                  title="Remover alimento"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              {food.substitutes.length > 0 && (
                                <div className="mt-2 space-y-1 border-t border-dashed border-[#e6ece6] pt-2">
                                  {food.substitutes.map((sub, i) => {
                                    const kcalDiff =
                                      Math.abs(sub.kcal100 - food.kcal100) /
                                      Math.max(food.kcal100, 1);
                                    const pDiff =
                                      Math.abs(
                                        sub.protein100 - food.protein100,
                                      ) / Math.max(food.protein100, 1);
                                    const cDiff =
                                      Math.abs(sub.carbs100 - food.carbs100) /
                                      Math.max(food.carbs100, 1);
                                    const fDiff =
                                      Math.abs(sub.fat100 - food.fat100) /
                                      Math.max(food.fat100, 1);
                                    const compatible = [
                                      kcalDiff,
                                      pDiff,
                                      cDiff,
                                      fDiff,
                                    ].every((diff) => diff <= 0.2);
                                    return (
                                      <div
                                        key={`${sub.name}-${i}`}
                                        className="flex flex-wrap items-center justify-between gap-2 text-[10px]"
                                      >
                                        <span className="text-[#66776b]">
                                          ↳ Substituto: {sub.name} (
                                          {fmt(sub.amount)} g)
                                        </span>
                                        <span
                                          className={`rounded-full px-2 py-1 font-semibold ${compatible ? 'bg-[#e8f5e9] text-[#287653]' : 'bg-[#fff4df] text-[#9a6828]'}`}
                                        >
                                          {compatible
                                            ? '✓ Alimento compatível'
                                            : 'Comparar porções'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {showSubstitutes?.mealId === meal.id &&
                                showSubstitutes.foodId === food.id && (
                                  <div className="mt-3 rounded-lg bg-[#f6f9f6] p-3 print:hidden">
                                    <div className="mb-2 text-[10px] font-bold">
                                      Adicionar alimento substituto
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <select
                                        value={selectedFood}
                                        onChange={(e) =>
                                          setSelectedFood(e.target.value)
                                        }
                                        className="form-control min-w-0 flex-1"
                                      >
                                        {foodCatalog
                                          .filter(
                                            (item) => item.name !== food.name,
                                          )
                                          .map((item) => (
                                            <option key={item.name}>
                                              {item.name}
                                            </option>
                                          ))}
                                      </select>
                                      <button
                                        onClick={() =>
                                          addSubstitute(
                                            meal.id,
                                            food.id,
                                            selectedFood || "foodCatalog[0]",
                                          )
                                        }
                                        className="btn-secondary"
                                      >
                                        <Plus size={12} />
                                        Comparar
                                      </button>
                                    </div>
                                    <p className="mt-2 text-[10px] text-[#849188]">
                                      A compatibilidade usa uma tolerância
                                      demonstrativa de ±20% em energia e
                                      macronutrientes por 100 g. A porção
                                      equivalente deve ser revisada pelo
                                      nutricionista.
                                    </p>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setShowAddFood(meal.id);
                            setSelectedFood(foodCatalog[0]?.name);
                          }}
                          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cbd9ce] py-2.5 text-[11px] font-semibold text-[#39835b] hover:bg-[#f5faf5] print:hidden"
                        >
                          <Plus size={13} />
                          Adicionar alimento
                        </button>
                      </div>
                    </div>
                  ))}
                  <section className="panel p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[12px] font-bold">
                        Total diário do plano
                      </div>
                      <div className="text-[17px] font-bold text-[#287653]">
                        {fmt(total.kcal)} kcal
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Derived
                        label="Proteínas"
                        value={`${fmt(total.protein, 1)} g`}
                      />
                      <Derived
                        label="Carboidratos"
                        value={`${fmt(total.carbs, 1)} g`}
                      />
                      <Derived
                        label="Lipídios"
                        value={`${fmt(total.fat, 1)} g`}
                      />
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-[10px] leading-5 text-[#849188]">
                      <Info size={13} className="mt-0.5 shrink-0" />
                      Valores calculados com os dados de demonstração do
                      catálogo de alimentos. Confira a base nutricional e as
                      quantidades antes de emitir o plano.
                    </div>
                  </section>
                </section>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="text-[10px] text-[#91a096]">
              Última atualização da ficha: 16 out, 2026
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => notify('Alterações salvas nesta demonstração.')}
                variant="secondary"
              >
                <Save size={14} />
                Salvar alterações
              </Button>
              {tab !== 'Plano alimentar' && (
                <Button
                  onClick={() => setTab('Plano alimentar')}
                  variant="primary"
                >
                  Montar plano alimentar <ChevronRight size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {showAddFood !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17251c]/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddFood(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold">Adicionar alimento</h3>
                <p className="mt-1 text-[11px] text-[#849188]">
                  Selecione um item do catálogo e informe a porção em gramas.
                </p>
              </div>
              <button
                onClick={() => setShowAddFood(null)}
                className="rounded-lg p-1.5 text-[#849188] hover:bg-[#f3f6f3]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-3 text-[#9aa69d]"
              />
              <input
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                placeholder="Buscar alimento..."
                className="form-control pl-9"
              />
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {filteredFoods.map((food) => (
                <button
                  key={food.name}
                  onClick={() => setSelectedFood(food.name)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${selectedFood === food.name ? 'border-[#83b594] bg-[#f1f8f2]' : 'border-[#edf1ed] hover:bg-[#fafcfa]'}`}
                >
                  <div>
                    <div className="text-[11px] font-semibold">{food.name}</div>
                    <div className="mt-1 text-[10px] text-[#849188]">
                      {food.kcal100} kcal/100 g · P {food.protein100} g
                    </div>
                  </div>
                  {selectedFood === food.name && (
                    <Check size={15} className="text-[#39835b]" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
                  Porção (g)
                </label>
                <input
                  type="number"
                  min="1"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="form-control"
                />
              </div>
              <button
                onClick={() => addFood(showAddFood)}
                className="btn-primary"
              >
                <Plus size={14} />
                Adicionar à refeição
              </button>
            </div>
          </div>
        </div>
      )}
      {showNewMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17251c]/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowNewMeal(false);
          }}
        >
          <form
            onSubmit={createMeal}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold">Nova refeição</h3>
                <p className="mt-1 text-[11px] text-[#849188]">
                  Você poderá adicionar alimentos após criar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMeal(false)}
                className="rounded-lg p-1.5 text-[#849188]"
              >
                <X size={17} />
              </button>
            </div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
              Nome da refeição
            </label>
            <input
              required
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              className="form-control mb-4"
            />
            <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
              Horário
            </label>
            <input
              required
              type="time"
              value={newMealTime}
              onChange={(e) => setNewMealTime(e.target.value)}
              className="form-control mb-5"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewMeal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                <Plus size={14} />
                Criar refeição
              </button>
            </div>
          </form>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-2 rounded-xl bg-[#243b2c] px-4 py-3 text-[12px] text-white shadow-lg"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#9ed3a9]" />
          {notice}
          <button onClick={() => setNotice('')} className="ml-2 text-white/70">
            <X size={14} />
          </button>
        </div>
      )}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .sidebar,
          .topbar,
          button,
          input,
          select,
          textarea {
            display: none !important;
          }
          .main {
            margin: 0 !important;
            padding: 0 !important;
          }
          .content {
            padding: 0 !important;
          }
        }
        .form-control {
          width: 100%;
          border: 1px solid #e2e9e3;
          border-radius: 8px;
          background: white;
          padding: 9px 10px;
          font-size: 12px;
          color: #324438;
          outline: none;
        }
        .form-control:focus {
          border-color: #72a883;
          box-shadow: 0 0 0 2px #72a88320;
        }
      `}</style>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  trend: 'down' | 'neutral' | 'good' | 'warning';
}) {
  const color =
    trend === 'good'
      ? 'text-[#287653]'
      : trend === 'warning'
        ? 'text-[#a35c35]'
        : 'text-[#6d8e76]';
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#849188]">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eff6f0] text-[#4d8b61]">
          <Icon size={15} />
        </span>
      </div>
      <div className="text-[23px] font-bold tracking-[-.6px]">{value}</div>
      <div
        className={`mt-2 flex items-start gap-1 text-[10px] leading-4 ${color}`}
      >
        {trend === 'down' ? (
          <ArrowDownRight size={12} className="mt-0.5 shrink-0" />
        ) : trend === 'good' ? (
          <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
        ) : trend === 'warning' ? (
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
        ) : null}
        {detail}
      </div>
    </div>
  );
}
function Progress({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const percent = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-[#65766b]">{label}</span>
        <span className="text-[10px] font-semibold text-[#3e5547]">
          {fmt(value, 1)} / {fmt(target, 1)} {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#edf1ed]">
        <div
          className="h-full rounded-full bg-[#65a579] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
function InfoRow({
  icon: Icon,
  title,
  text,
  alert = false,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  alert?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className={`mt-0.5 ${alert ? 'text-[#b57837]' : 'text-[#71917a]'}`}>
        <Icon size={15} />
      </div>
      <div>
        <div className="text-[11px] font-semibold">{title}</div>
        <div
          className={`mt-1 text-[10px] leading-4 ${alert ? 'text-[#a36d36]' : 'text-[#849188]'}`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
function Task({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border border-[#dce8de] text-[#5a956b]">
        <Check size={11} />
      </span>
      <div>
        <div className="text-[11px] font-semibold">{title}</div>
        <div className="mt-1 text-[10px] text-[#849188]">{detail}</div>
      </div>
    </div>
  );
}
function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eff6f0] text-[#39835b]">
        <Icon size={17} />
      </span>
      <div>
        <h2 className="text-[14px] font-bold">{title}</h2>
        <p className="mt-1 text-[10px] leading-4 text-[#849188]">
          {description}
        </p>
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  editable,
}: {
  label: string;
  value: string;
  editable: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
        {label}
      </label>
      <input
        defaultValue={value}
        disabled={!editable}
        className="form-control disabled:bg-[#f8faf8] disabled:text-[#617166]"
      />
    </div>
  );
}
function NumberField({
  label,
  unit,
  value,
  onChange,
  step = '1',
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-[#627368]">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="form-control pr-12"
        />
        <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-[#95a198]">
          {unit}
        </span>
      </div>
    </div>
  );
}
function Derived({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e8eee8] bg-white p-3">
      <div className="text-[10px] text-[#849188]">{label}</div>
      <div className="mt-1 text-[13px] font-bold">{value}</div>
    </div>
  );
}
function MacroSlider({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11px] font-semibold text-[#627368]">
          {label}
        </label>
        <span className={`text-[12px] font-bold ${color}`}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#4d966b]"
      />
    </div>
  );
}
function MacroResult({
  label,
  percent,
  grams,
  kcal,
  color,
}: {
  label: string;
  percent: number;
  grams: number;
  kcal: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e8eee8] p-3">
      <span className={`h-8 w-1.5 rounded-full ${color}`} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold">
          {label}{' '}
          <span className="font-normal text-[#849188]">({percent}%)</span>
        </div>
        <div className="mt-1 text-[10px] text-[#849188]">
          {fmt(kcal)} kcal da meta diária
        </div>
      </div>
      <div className="text-right">
        <div className="text-[14px] font-bold">{fmt(grams, 1)} g</div>
        <div className="text-[9px] text-[#849188]">por dia</div>
      </div>
    </div>
  );
}
