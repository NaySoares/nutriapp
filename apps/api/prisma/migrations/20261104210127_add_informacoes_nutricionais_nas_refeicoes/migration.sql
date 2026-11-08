/*
  Warnings:

  - You are about to drop the column `lipidios_g` on the `itens_refeicoes_planos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "itens_refeicoes_planos" DROP COLUMN "lipidios_g",
ADD COLUMN     "lipidio_g" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "refeicoes" ADD COLUMN     "carboidrato_g" DECIMAL(10,2),
ADD COLUMN     "energia_kcal" DECIMAL(10,2),
ADD COLUMN     "fibra_g" DECIMAL(10,2),
ADD COLUMN     "lipidio_g" DECIMAL(10,2),
ADD COLUMN     "porcao_gramas" DECIMAL(8,2),
ADD COLUMN     "proteina_g" DECIMAL(10,2),
ADD COLUMN     "sodio_mg" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "refeicoes_planos" ADD COLUMN     "carboidrato_g" DECIMAL(10,2),
ADD COLUMN     "energia_kcal" DECIMAL(10,2),
ADD COLUMN     "fibra_g" DECIMAL(10,2),
ADD COLUMN     "lipidio_g" DECIMAL(10,2),
ADD COLUMN     "porcao_gramas" DECIMAL(8,2),
ADD COLUMN     "proteina_g" DECIMAL(10,2),
ADD COLUMN     "sodio_mg" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "itens_refeicao_alimento_id_idx" ON "itens_refeicao"("alimento_id");

-- CreateIndex
CREATE INDEX "itens_refeicao_medida_id_idx" ON "itens_refeicao"("medida_id");

-- CreateIndex
CREATE INDEX "itens_refeicoes_planos_alimento_id_idx" ON "itens_refeicoes_planos"("alimento_id");

-- CreateIndex
CREATE INDEX "itens_refeicoes_planos_medida_id_idx" ON "itens_refeicoes_planos"("medida_id");
