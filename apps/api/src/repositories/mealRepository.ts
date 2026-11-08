import { Prisma, type PrismaClient } from "@prisma/client";
import { MealCreate, MealRecord, MealUpdate, MealListData } from "@nutriapp/shared";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@nutriapp/shared";
import { MealFilters } from "../services/mealService";

type Db = Pick<PrismaClient, "refeicao">;

export type MealRepositoryList = {
  items: MealListData[];
  total: number;
  page: number;
  pageSize: number;
};

const mealSelect = {
  id: true, nome: true, descricao: true, tipo: true, porcaoGramas: true,
  energiaKcal: true, proteinaG: true, lipidiosG: true, carboidratoG: true,
  fibraG: true, sodioMg: true, itens: true, criadoEm: true, atualizadoEm: true,
} satisfies Prisma.RefeicaoSelect;

const mealListSelect = {
  ...mealSelect,
  itens: {
    select: {
      id: true,
      alimentoId: true,
      gramas: true,
      nome: true,
      medidaId: true,
      quantidadeMedida: true,
      ordem: true,
      alimento: {
        select: {
          porcaoReferencia: true,
          energiaKcal: true,
          proteinaG: true,
          carboidratoG: true,
          lipidiosG: true,
          fibraG: true,
          sodioMg: true,
        },
      },
    },
  },
} satisfies Prisma.RefeicaoSelect;

type MealListRow = Prisma.RefeicaoGetPayload<{
  select: typeof mealListSelect;
}>;

type Row = Prisma.RefeicaoGetPayload<{ select: typeof mealSelect }>;

const num = (value: Prisma.Decimal | null) => (value === null ? null : value.toNumber());

const toRecord = (row: Row | MealListRow): MealRecord => ({
  ...row,
  nome: row.nome.trim(),
  descricao: row.descricao?.trim() ?? null,
  tipo: row.tipo,
  porcaoGramas: num(row.porcaoGramas),
  energiaKcal: num(row.energiaKcal),
  proteinaG: num(row.proteinaG),
  lipidiosG: num(row.lipidiosG),
  carboidratoG: num(row.carboidratoG),
  fibraG: num(row.fibraG),
  sodioMg: num(row.sodioMg),

  items: row.itens.map((item) => ({
    id: item.id,
    alimentoId: item.alimentoId,
    nome: item.nome,
    gramas: item.gramas.toNumber(),
    medidaId: item.medidaId,
    quantidadeMedida: num(item.quantidadeMedida),
    ordem: item.ordem,
  })),
});

export type MealRepository = ReturnType<typeof createMealRepository>;

export function createMealRepository(db: Db) {
  const find = async (mealId: string): Promise<MealRecord | null> => {
    const row = await db.refeicao.findUnique({ where: { id: mealId }, select: mealSelect });
    return row && toRecord(row);
  };

  return {
    find,

    async create(data: MealCreate, ownerId: string): Promise<MealRecord> {
      const { itens, ...rest } = data;
      const row = await db.refeicao.create({
        data: {
          ...rest,
          criadoPor: ownerId ?? null,
          itens: itens
            ? {
                create: itens.map((item) => ({
                  alimentoId: item.alimentoId,
                  nome: item.nome,
                  gramas: item.gramas,
                  medidaId: item.medidaId,
                  quantidadeMedida: item.quantidadeMedida,
                  ordem: item.ordem,
                })),
              }
            : undefined,
        },
        select: mealSelect,
      })
      return toRecord(row);
    },

    async list(filters: MealFilters = {}): Promise<MealRepositoryList> {
      const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
      const page = Math.max(filters.page ?? 1, 1);

      const where: Prisma.RefeicaoWhereInput = {
        ...(filters.q ? { nome: { contains: filters.q, mode: "insensitive" } } : {}),
        ...(filters.tipo ? { tipo: filters.tipo } : {}),
      };

      const [rows, total] = await Promise.all([
        db.refeicao.findMany({
          where,
          orderBy: [{ nome: "asc" }, { id: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: mealListSelect,
        }),
        db.refeicao.count({ where }),
      ]);

      const items = rows.map((row): MealListData => ({
        meal: toRecord(row),
        items: row.itens.map((item) => ({
          gramas: item.gramas.toNumber(),
          alimento: {
            porcaoReferencia: item.alimento.porcaoReferencia!,
            energiaKcal: num(item.alimento.energiaKcal),
            proteinaG: num(item.alimento.proteinaG),
            carboidratoG: num(item.alimento.carboidratoG),
            lipidiosG: num(item.alimento.lipidiosG),
            fibraG: num(item.alimento.fibraG),
            sodioMg: num(item.alimento.sodioMg),
          },
        })),
      }));

      return { items, total, page, pageSize };
    },

    async update(mealId: string, data: MealUpdate): Promise<MealRecord> {
      const { itens, ...rest } = data;

      const row = await db.refeicao.update({
        where: { id: mealId },
        data: {
          ...rest,
          itens: itens
            ? {
                deleteMany: {},
                create: itens.map((item) => ({
                  alimentoId: item.alimentoId,
                  gramas: item.gramas,
                  nome: item.nome,
                  medidaId: item.medidaId,
                  quantidadeMedida: item.quantidadeMedida,
                  ordem: item.ordem,
                })),
              }
            : undefined,
        },
        select: mealSelect,
      });

      return toRecord(row);
    },

    async remove(mealId: string): Promise<boolean> {
      const { count } = await db.refeicao.deleteMany({ where: { id: mealId } });
      return count === 1;
    },
  };
}