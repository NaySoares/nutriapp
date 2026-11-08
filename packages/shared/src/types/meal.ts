import { z } from "zod";


export const TYPE_MEAL = {
  PREPARED: "preparada",
  COMPOSED: "composta",
} as const;

export const typeMeal = z.enum(["preparada", "composta"]);

export type TypeMeal = (typeof TYPE_MEAL)[keyof typeof TYPE_MEAL];

export const TYPE_MEAL_LABELS = {
  preparada: "Preparada",
  composta: "Composta",
}

// duplicado apenas para manter a semântica fora do contexto de validação
const uuidSchema = z.string().uuid();
export const mealIdSchema = z.string().uuid();

const decimalSchema = z.number().finite().nonnegative();

const porcaoGramasSchema = z.number().finite().positive();

const nutrientesSchema = {
  energiaKcal: decimalSchema.nullable().optional(),
  proteinaG: decimalSchema.nullable().optional(),
  lipidiosG: decimalSchema.nullable().optional(),
  carboidratoG: decimalSchema.nullable().optional(),
  fibraG: decimalSchema.nullable().optional(),
  sodioMg: decimalSchema.nullable().optional(),
};

const nutrientesObrigatoriosSchema = {
  energiaKcal: decimalSchema,
  proteinaG: decimalSchema,
  lipidiosG: decimalSchema,
  carboidratoG: decimalSchema,
  fibraG: decimalSchema,
  sodioMg: decimalSchema,
};

const ItemMealBaseSchema = z.object({
  alimentoId: uuidSchema,
  gramas: porcaoGramasSchema,
  nome: z.string(),
  medidaId: uuidSchema.nullable().optional(),
  quantidadeMedida: decimalSchema.nullable().optional(),
  ordem: z.number().int().nonnegative(),
});

// Item da biblioteca
export const ItemMealCreateSchema = ItemMealBaseSchema.superRefine(
  (data, ctx) => {
    if (data.quantidadeMedida != null && !data.medidaId) {
      ctx.addIssue({
        code: "custom",
        path: ["medidaId"],
        message: "Informe a medida caseira quando houver quantidade de medida.",
      });
    }
  },
);

export const ItemMealUpdateSchema = ItemMealBaseSchema.partial()
  .extend({
    id: uuidSchema,
  })
  .superRefine((data, ctx) => {
    if (data.quantidadeMedida != null && !data.medidaId) {
      ctx.addIssue({
        code: "custom",
        path: ["medidaId"],
        message: "Informe a medida caseira quando houver quantidade de medida.",
      });
    }
  });

// Refeição da biblioteca
const MealBaseSchema = z.object({
  nome: z.string().trim().min(1).max(255),
  descricao: z.string().trim().max(255).nullable().optional(),
  tipo: typeMeal,
  porcaoGramas: porcaoGramasSchema.nullable().optional(),
  ...nutrientesSchema,
});

export const MealCreateSchema = MealBaseSchema.extend({
  itens: z.array(ItemMealCreateSchema).optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === TYPE_MEAL.PREPARED) {
    if (data.itens?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["itens"],
        message: "Refeições preparadas não podem possuir itens.",
      });
    }

    for (const campo of Object.keys(nutrientesObrigatoriosSchema) as Array<
      keyof typeof nutrientesObrigatoriosSchema
    >) {
      if (data[campo] == null) {
        ctx.addIssue({
          code: "custom",
          path: [campo],
          message: "Este campo é obrigatório para refeições preparadas.",
        });
      }
    }

    if (data.porcaoGramas == null) {
      ctx.addIssue({
        code: "custom",
        path: ["porcaoGramas"],
        message: "Informe a porção em gramas.",
      });
    }
  }

  if (data.tipo === TYPE_MEAL.COMPOSED && (!data.itens || data.itens.length === 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["itens"],
      message: "Refeições compostas precisam possuir pelo menos um item.",
    });
  }
});

export const MealUpdateSchema = MealBaseSchema.partial()
  .extend({
    id: uuidSchema,
    itens: z.array(ItemMealCreateSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === TYPE_MEAL.PREPARED && data.itens?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["itens"],
        message: "Refeições preparadas não podem possuir itens.",
      });
    }

    if (data.tipo === TYPE_MEAL.COMPOSED && data.itens?.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["itens"],
        message: "Refeições compostas precisam possuir pelo menos um item.",
      });
    }

    if (Object.keys(data).length === 1) {
      ctx.addIssue({
        code: "custom",
        message: "Informe pelo menos um campo para atualização.",
      });
    }
  });

export type ItemsMealRecord = {
  id: string;
  alimentoId: string;
  nome: string;
  gramas: number;
  medidaId: string | null;
  quantidadeMedida: number | null;
  ordem: number;
};

export type MealRecord = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TypeMeal;
  porcaoGramas: number | null;
  energiaKcal: number | null;
  proteinaG: number | null;
  lipidiosG: number | null;
  carboidratoG: number | null;
  fibraG: number | null;
  sodioMg: number | null;
  items: Array<ItemsMealRecord>;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type MealListData = {
  meal: MealRecord;
  items: {
    gramas: number;
    alimento: {
      porcaoReferencia: number;
      energiaKcal: number | null;
      proteinaG: number | null;
      carboidratoG: number | null;
      lipidiosG: number | null;
      fibraG: number | null;
      sodioMg: number | null;
    };
  }[];
};


export type MealPage = { items: MealRecord[]; total: number; page: number; pageSize: number };

export type MealIdSchema = z.infer<typeof uuidSchema>;

export type MealCreate = z.infer<typeof MealCreateSchema>;
export type MealUpdate = z.infer<typeof MealUpdateSchema>;

export type ItemMealCreate = z.infer<typeof ItemMealCreateSchema>;
export type ItemMealUpdate = z.infer<typeof ItemMealUpdateSchema>;

export type ListMealResult =
  | { success: true; data: MealPage }
  | { success: false; reason: "UNAUTHORIZED" }

export type CreateMealResult =
  | { success: true; data: MealRecord }
  | { success: false; reason: "UNAUTHORIZED" }

export type UpdateMealResult =
  | { success: true; data: MealRecord }
  | { success: false; reason: "UNAUTHORIZED"}
  | { success: false; reason: "NOT_FOUND" }

export type DeleteMealResult =
  | { success: true }
  | { success: false; reason: "UNAUTHORIZED"}
  | { success: false; reason: "NOT_FOUND" }