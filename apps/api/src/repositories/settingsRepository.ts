
import type { PrismaClient } from "@prisma/client";
import { DEFAULT_ACTIVITY_FACTORS } from "@nutriapp/shared";

type Db = Pick<PrismaClient, "nutricionista">;

export type Formula = "mifflin" | "harris_benedict";

export type NutritionistSettings = {
  formulaPadrao: Formula;
  fatoresAtividade: Record<string, number>;
};

export type SettingsRepository = {
  /** Retorna os fatores exatamente como estão salvos (sem aplicar os padrões). */
  findNutritionistSettings: (
    id: string
  ) => Promise<NutritionistSettings | null>;

  /** Retorna os fatores salvos mesclados sobre DEFAULT_ACTIVITY_FACTORS. */
  findSettings: (id: string) => Promise<NutritionistSettings | null>;

  updateSettings: (
    id: string,
    data: NutritionistSettings
  ) => Promise<NutritionistSettings>;
};

const settingsSelect = {
  formulaPadrao: true,
  fatoresAtividade: true,
} as const;

export function createSettingsRepository(
  prisma: Db
): SettingsRepository {
  return {
    findNutritionistSettings: async (id) => {
      const settings = await prisma.nutricionista.findUnique({
        where: { id },
        select: settingsSelect,
      });

      if (!settings) return null;

      return {
        formulaPadrao: settings.formulaPadrao,
        fatoresAtividade:
          settings.fatoresAtividade as Record<string, number>,
      };
    },

    findSettings: async (id) => {
      const settings = await prisma.nutricionista.findUnique({
        where: { id },
        select: settingsSelect,
      });

      if (!settings) return null;

      return {
        formulaPadrao: settings.formulaPadrao,
        fatoresAtividade: {
          ...DEFAULT_ACTIVITY_FACTORS,
          ...(settings.fatoresAtividade as Record<string, number>),
        },
      };
    },

    updateSettings: async (id, data) => {
      const settings = await prisma.nutricionista.update({
        where: { id },
        data,
        select: settingsSelect,
      });

      return {
        formulaPadrao: settings.formulaPadrao,
        fatoresAtividade:
          settings.fatoresAtividade as Record<string, number>,
      };
    },
  };
}
