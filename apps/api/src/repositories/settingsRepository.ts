import { DEFAULT_ACTIVITY_FACTORS } from "@nutriapp/shared";
import type { AuthPrisma } from "../types/auth.js";
import { asSettingsClient } from "./prismaClientsRepository.js";

export type Formula = "mifflin" | "harris_benedict";

export type NutritionistSettings = {
  formulaPadrao: Formula;
  fatoresAtividade: Record<string, number>;
};

export type SettingsRepository = {
  /** Retorna os fatores exatamente como estão salvos (sem aplicar os padrões). */
  findNutritionistSettings: (id: string) => Promise<NutritionistSettings | null>;
  /** Retorna os fatores salvos mesclados sobre DEFAULT_ACTIVITY_FACTORS. */
  findSettings: (id: string) => Promise<NutritionistSettings | null>;
  updateSettings: (id: string, data: NutritionistSettings) => Promise<NutritionistSettings>;
};

const settingsSelect = { formulaPadrao: true, fatoresAtividade: true } as const;

export function createSettingsRepository(prisma: AuthPrisma): SettingsRepository {
  const client = asSettingsClient(prisma);

  return {
    findNutritionistSettings: (id) =>
      client.nutricionista.findUnique({ where: { id }, select: settingsSelect }).then(
        (settings) =>
          settings && {
            formulaPadrao: settings.formulaPadrao,
            fatoresAtividade: settings.fatoresAtividade as Record<string, number>,
          }
      ),

    findSettings: (id) =>
      client.nutricionista.findUnique({ where: { id }, select: settingsSelect }).then(
        (settings) =>
          settings && {
            formulaPadrao: settings.formulaPadrao,
            fatoresAtividade: {
              ...DEFAULT_ACTIVITY_FACTORS,
              ...(settings.fatoresAtividade as Record<string, number>),
            },
          }
      ),

    updateSettings: (id, data) =>
      client.nutricionista.update({ where: { id }, data, select: settingsSelect }).then((settings) => ({
        formulaPadrao: settings.formulaPadrao,
        fatoresAtividade: settings.fatoresAtividade as Record<string, number>,
      })),
  };
}