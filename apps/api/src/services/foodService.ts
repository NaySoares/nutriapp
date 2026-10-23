import type { FoodCreateInput, FoodUpdateInput } from "@nutriapp/shared";
import type { SessionRepository } from "../repositories/sessionRepository.js";
import type { FoodRepository } from "../repositories/foodRepository.js";
import { FonteAlimento } from "@prisma/client";

type FoodServiceDependencies = {
  sessions: SessionRepository;
  foods: FoodRepository;
};

function isFonteAlimento(value: string): value is FonteAlimento {
  return Object.values(FonteAlimento).includes(value as FonteAlimento);
}

export function createFoodService({
  sessions,
  foods,
}: FoodServiceDependencies) {
  return {
    async list(sessionId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;

      return foods.list();
    },

    async create(sessionId: string, input: FoodCreateInput) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { medidaId: _medidaId, planoId: _planoId, ...foodData } = input;

      if (!isFonteAlimento(foodData.fonte)) {
        throw new Error("Fonte de alimento inválida");
      }

      return foods.create({
        ...foodData,
        fonte: foodData.fonte,
      });
    },

    async update(
      sessionId: string,
      foodId: string,
      input: FoodUpdateInput
    ) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;

      const existing = await foods.find(foodId);
      if (!existing) return undefined;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { medidaId: _medidaId, planoId: _planoId, ...foodData } = input;

      return foods.update(foodId, {
        ...foodData,
        fonte: foodData.fonte! as string as FonteAlimento, // FonteAlimento é obrigatória no update
      });
    },

    async remove(sessionId: string, foodId: string) {
      const ownerId = await sessions.findSessionOwner(sessionId);
      if (!ownerId) return null;

      return foods.remove(foodId);
    },
  };
}

export type FoodService = ReturnType<typeof createFoodService>;
