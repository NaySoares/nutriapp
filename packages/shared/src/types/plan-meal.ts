import { z } from "zod";

const TIPO_REFEICAO = ["preparada", "composta"] as const;
const CATEGORIA_REFEICAO = ["cafe_da_manha", "lanche", "almoco", "jantar", "ceia", "outro"] as const;

const uuidSchema = z.string().uuid();

const decimalSchema = z.number().finite().nonnegative();

const porcaoGramasSchema = z.number().finite().positive();

// Item pertencente a uma refeição do plano
export const ItemRefeicaoPlanoCreateSchema = z.object({
  alimentoId: uuidSchema.nullable().optional(),
  alimentoNome: z.string().trim().min(1).max(255),
  gramas: porcaoGramasSchema,
  medidaId: uuidSchema.nullable().optional(),
  medidaDescricao: z.string().trim().max(255).nullable().optional(),
  quantidadeMedida: decimalSchema.nullable().optional(),
  ordem: z.number().int().nonnegative(),

  energiaKcal: decimalSchema.nullable().optional(),
  proteinaG: decimalSchema.nullable().optional(),
  lipidiosG: decimalSchema.nullable().optional(),
  carboidratoG: decimalSchema.nullable().optional(),
  fibraG: decimalSchema.nullable().optional(),
  sodioMg: decimalSchema.nullable().optional(),
});

export const ItemRefeicaoPlanoUpdateSchema =
  ItemRefeicaoPlanoCreateSchema.partial().extend({
    id: uuidSchema,
  });

// Refeição pertencente ao plano alimentar
const RefeicaoPlanoBaseSchema = z.object({
  planoId: uuidSchema,
  refeicaoId: uuidSchema.nullable().optional(),

  nome: z.string().trim().min(1).max(255),
  descricao: z.string().trim().max(255).nullable().optional(),
  tipo: z.enum(TIPO_REFEICAO),
  categoria: z.enum(CATEGORIA_REFEICAO),
  horario: z.string().trim().max(10).nullable().optional(),
  ordem: z.number().int().nonnegative().default(0),

  porcaoGramas: porcaoGramasSchema.nullable().optional(),

  energiaKcal: decimalSchema.nullable().optional(),
  proteinaG: decimalSchema.nullable().optional(),
  lipidiosG: decimalSchema.nullable().optional(),
  carboidratoG: decimalSchema.nullable().optional(),
  fibraG: decimalSchema.nullable().optional(),
  sodioMg: decimalSchema.nullable().optional(),
});

export const RefeicaoPlanoCreateSchema = RefeicaoPlanoBaseSchema.extend({
  itens: z.array(ItemRefeicaoPlanoCreateSchema).optional(),
});

export const RefeicaoPlanoUpdateSchema = RefeicaoPlanoBaseSchema
  .omit({ planoId: true })
  .partial()
  .extend({
    id: uuidSchema,
    itens: z.array(ItemRefeicaoPlanoCreateSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 1) {
      ctx.addIssue({
        code: "custom",
        message: "Informe pelo menos um campo para atualização.",
      });
    }
  });

export type RefeicaoPlanoCreate = z.infer<typeof RefeicaoPlanoCreateSchema>;
export type RefeicaoPlanoUpdate = z.infer<typeof RefeicaoPlanoUpdateSchema>;

export type ItemRefeicaoPlanoCreate = z.infer<
  typeof ItemRefeicaoPlanoCreateSchema
>;

export type ItemRefeicaoPlanoUpdate = z.infer<
  typeof ItemRefeicaoPlanoUpdateSchema
>;