import { type CreateMealResult, type ListMealResult, type DeleteMealResult, type MealCreate, type MealUpdate, type UpdateMealResult, TYPE_MEAL, TypeMeal, MealRecord, MealListData, MealPage} from "@nutriapp/shared";
import type { SessionRepository } from "../repositories/sessionRepository.js";
import type { MealRepository } from "../repositories/mealRepository.js";

type MealServiceDependencies = {
  sessions: SessionRepository;
  meals: MealRepository;
};

export type MealFilters = {
  q?: string;
  tipo?: TypeMeal;
  page?: number; // começa em 1
  pageSize?: number; // padrão 50, máximo 100
};

export function createMealService({
  sessions,
  meals,
}: MealServiceDependencies) {
  return {
    async list(sessionId: string, filters: MealFilters): Promise<ListMealResult> {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return { success: false, reason: "UNAUTHORIZED" };

      const result = await meals.list(filters);

      const items = result.items.map(({ meal, items }) => {
        if (meal.tipo !== TYPE_MEAL.COMPOSED) return meal;

        return {
          ...meal,
          ...calculateNutrients(items),
        };
      });

      const data: MealPage = {
        ...result,
        items,
      };

      return {
        success: true,
        data,
      };
    },

    async create(sessionId: string, input: MealCreate): Promise<CreateMealResult> {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return { success: false, reason: "UNAUTHORIZED" };

      const result = await meals.create(input, ownerId);
      return { success: true, data: result };
    },

    async update(
      sessionId: string,
      mealId: string,
      input: MealUpdate
    ): Promise<UpdateMealResult> {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return { success: false, reason: "UNAUTHORIZED" };

      const existing = await meals.find(mealId);
      if (!existing) return { success: false, reason: "NOT_FOUND" };

      const result = await meals.update(mealId, input);
      return { success: true, data: result };
    },

    async remove(sessionId: string, mealId: string): Promise<DeleteMealResult> {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return { success: false, reason: "UNAUTHORIZED" };

      await meals.remove(mealId);
      return { success: true };
    },
  };
}

function calculateNutrients(
  items: MealListData["items"]
): Pick<
  MealRecord,
  | "energiaKcal"
  | "proteinaG"
  | "carboidratoG"
  | "lipidiosG"
  | "fibraG"
  | "sodioMg"
> {
  return items.reduce(
    (total, item) => {
      const factor = item.gramas / item.alimento.porcaoReferencia;
      const food = item.alimento;

      total.energiaKcal += (food.energiaKcal ?? 0) * factor;
      total.proteinaG += (food.proteinaG ?? 0) * factor;
      total.carboidratoG += (food.carboidratoG ?? 0) * factor;
      total.lipidiosG += (food.lipidiosG ?? 0) * factor;
      total.fibraG += (food.fibraG ?? 0) * factor;
      total.sodioMg += (food.sodioMg ?? 0) * factor;

      return total;
    },
    {
      energiaKcal: 0,
      proteinaG: 0,
      carboidratoG: 0,
      lipidiosG: 0,
      fibraG: 0,
      sodioMg: 0,
    }
  );
}

export type MealService = ReturnType<typeof createMealService>;
