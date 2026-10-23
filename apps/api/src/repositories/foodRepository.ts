import { Prisma, type FonteAlimento, type PrismaClient } from "@prisma/client";
import type { FoodCreateInput } from "@nutriapp/shared";

type Db = Pick<PrismaClient, "alimento">;

// Catálogo: sem medidaId/planoId (medidas e planos se ligam ao alimento depois)
export type FoodCreateData = Omit<
  FoodCreateInput,
  "medidaId" | "planoId" | "fonte"
> & {
  fonte: FonteAlimento;
};
export type FoodUpdateData = Partial<FoodCreateData>;

export type FoodRecord = {
  id: string;
  fonte: FonteAlimento;
  idExterno: string;
  nome: string;
  nomeBusca: string;
  grupo: string | null;
  energiaKcal: number | null;
  proteinaG: number | null;
  lipidiosG: number | null;
  carboidratoG: number | null;
  fibraG: number | null;
  sodioMg: number | null;
  outros: Record<string, unknown> | null;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type FoodFilters = {
  q?: string;
  fonte?: FonteAlimento;
  grupo?: string;
  page?: number; // começa em 1
  pageSize?: number; // padrão 50, máximo 100
};

export type FoodPage = { items: FoodRecord[]; total: number; page: number; pageSize: number };

const foodSelect = {
  id: true, fonte: true, idExterno: true, nome: true, nomeBusca: true, grupo: true,
  energiaKcal: true, proteinaG: true, lipidiosG: true, carboidratoG: true,
  fibraG: true, sodioMg: true, outros: true, criadoEm: true, atualizadoEm: true,
} satisfies Prisma.AlimentoSelect;

type Row = Prisma.AlimentoGetPayload<{ select: typeof foodSelect }>;

const num = (value: Prisma.Decimal | null) => (value === null ? null : value.toNumber());

const toRecord = (row: Row): FoodRecord => ({
  ...row,
  energiaKcal: num(row.energiaKcal),
  proteinaG: num(row.proteinaG),
  lipidiosG: num(row.lipidiosG),
  carboidratoG: num(row.carboidratoG),
  fibraG: num(row.fibraG),
  sodioMg: num(row.sodioMg),
  outros: row.outros as Record<string, unknown> | null,
});

// undefined = não mexe; null = grava NULL no banco; objeto = grava o JSON
const toJson = (value: Record<string, unknown> | null | undefined) =>
  value === undefined ? undefined : value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue);

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export type FoodRepository = ReturnType<typeof createFoodRepository>;

export function createFoodRepository(db: Db) {
  const find = async (foodId: string): Promise<FoodRecord | null> => {
    const row = await db.alimento.findUnique({ where: { id: foodId }, select: foodSelect });
    return row && toRecord(row);
  };

  return {
    find,

    /** Pode lançar P2002 (fonte + idExterno já existem): o serviço deve responder 409. */
    async create(data: FoodCreateData): Promise<FoodRecord> {
      const { outros, ...rest } = data;
      const row = await db.alimento.create({
        data: { ...rest, outros: toJson(outros) },
        select: foodSelect,
      });
      return toRecord(row);
    },

    async list(filters: FoodFilters = {}): Promise<FoodPage> {
      const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
      const page = Math.max(filters.page ?? 1, 1);

      const where: Prisma.AlimentoWhereInput = {
        ...(filters.q ? { nomeBusca: { contains: filters.q, mode: "insensitive" } } : {}),
        ...(filters.fonte ? { fonte: filters.fonte } : {}),
        ...(filters.grupo ? { grupo: filters.grupo } : {}),
      };

      const [rows, total] = await Promise.all([
        db.alimento.findMany({
          where,
          orderBy: [{ nome: "asc" }, { id: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: foodSelect,
        }),
        db.alimento.count({ where }),
      ]);

      return { items: rows.map(toRecord), total, page, pageSize };
    },

    async update(foodId: string, data: FoodUpdateData): Promise<FoodRecord | null> {
      const { outros, ...rest } = data;
      const { count } = await db.alimento.updateMany({
        where: { id: foodId },
        data: { ...rest, outros: toJson(outros) },
      });
      return count === 1 ? find(foodId) : null;
    },

    async remove(foodId: string): Promise<boolean> {
      const { count } = await db.alimento.deleteMany({ where: { id: foodId } });
      return count === 1;
    },
  };
}