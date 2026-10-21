import type { AuthPrisma } from "../types/auth.js";
import { asProfileClient } from "./prismaClientsRepository.js";

export type NutritionistProfile = {
  id: string;
  email: string;
  nome: string;
  crn: string | null;
  logoPath: string | null;
};

export type NutritionistRepository = {
  createNutritionist: (data: {
    email: string;
    senhaHash: string;
    nome: string;
    fatoresAtividade: Record<string, number>;
  }) => Promise<{ id: string; email: string; nome: string }>;
  findNutritionistByEmail: (email: string) => Promise<{
    id: string;
    email: string;
    nome: string;
    senhaHash: string;
  } | null>;
  updatePassword: (id: string, senhaHash: string) => Promise<unknown>;
  findProfile: (id: string) => Promise<NutritionistProfile | null>;
  updateProfile: (
    id: string,
    data: { nome?: string; crn?: string | null; logoPath?: string }
  ) => Promise<NutritionistProfile>;
};

const profileSelect = { id: true, email: true, nome: true, crn: true, logoPath: true } as const;

export function createNutritionistRepository(prisma: AuthPrisma): NutritionistRepository {
  const profileClient = asProfileClient(prisma);

  return {
    createNutritionist: (data) =>
      prisma.nutricionista.create({
        data,
        select: { id: true, email: true, nome: true },
      }),

    findNutritionistByEmail: (email) =>
      prisma.nutricionista.findUnique({
        where: { email },
        select: { id: true, email: true, nome: true, senhaHash: true },
      }),

    updatePassword: (id, senhaHash) =>
      prisma.nutricionista.update({
        where: { id },
        data: { senhaHash },
      }),

    findProfile: (id) =>
      profileClient.nutricionista.findUnique({ where: { id }, select: profileSelect }),

    updateProfile: (id, data) =>
      profileClient.nutricionista.update({ where: { id }, data, select: profileSelect }),
  };
}