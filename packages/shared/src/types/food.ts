import { z } from "zod";

export type FoodRecord = {
  id: string;
  fonte: string;
  idExterno: string;
  nome: string;
  nomeBusca: string;
  grupo: string;
  energiaKcal: number;
  proteinaG: number;
  lipidiosG: number;
  carboidratoG: number;
  fibraG: number;
  sodioMg: number;
  outros: Record<string, unknown> | null;
  criadoEm: Date;
  atualizadoEm: Date;
  planoId?: string | undefined;
  medidaId?: string | undefined;
};

export type FoodPage = {
  alimentos: {
    items: FoodRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export const foodCreateSchema = z.object({
  fonte: z.string().trim().min(1).max(120),
  idExterno: z.string().trim().min(1).max(120),
  nome: z.string().trim().min(1).max(120),
  nomeBusca: z.string().trim().min(1).max(120),
  grupo: z.string().trim().max(120),
  energiaKcal: z.number(),
  proteinaG: z.number(),
  lipidiosG: z.number(),
  carboidratoG: z.number(),
  fibraG: z.number(),
  sodioMg: z.number(),
  outros: z.record(z.unknown()).nullable().default(null),
  medidaId: z.string().uuid().optional(),
  planoId: z.string().uuid().optional()
})

const foodUpdateBase = foodCreateSchema.partial();
export type foodUpdate = z.infer<typeof foodUpdateBase>;

export const foodUpdateSchema: z.ZodType<foodUpdate> =
  foodUpdateBase.refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: "Informe ao menos um campo para atualizar." }
  );

export const foodIdSchema = z.string().uuid();

export type FoodCreateInput = z.infer<typeof foodCreateSchema>;
export type FoodUpdateInput = z.infer<typeof foodUpdateSchema>;