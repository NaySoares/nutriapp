/*
  Warnings:

  - You are about to drop the column `note` on the `agendamentos` table. All the data in the column will be lost.
  - You are about to drop the column `atualizado_em` on the `auditoria_acessos` table. All the data in the column will be lost.
  - You are about to drop the column `atualizado_em` on the `consentimentos` table. All the data in the column will be lost.
  - The `status` column on the `pacientes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `horario` on the `refeicoes` table. All the data in the column will be lost.
  - You are about to drop the column `ordem` on the `refeicoes` table. All the data in the column will be lost.
  - You are about to drop the column `plano_id` on the `refeicoes` table. All the data in the column will be lost.
  - You are about to drop the `itens_plano` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nutricionista_id,cpf]` on the table `pacientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_hash]` on the table `reset_senha` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refresh_token_hash]` on the table `sessoes` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `local` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `tipo` to the `refeicoes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoriaRefeicao" AS ENUM ('cafe_da_manha', 'lanche', 'almoco', 'jantar', 'ceia', 'outro');

-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('preparada', 'composta');

-- CreateEnum
CREATE TYPE "StatusPaciente" AS ENUM ('ativo', 'retorno_pendente', 'inativo');

-- DropForeignKey
ALTER TABLE "itens_plano" DROP CONSTRAINT "itens_plano_alimento_id_fkey";

-- DropForeignKey
ALTER TABLE "itens_plano" DROP CONSTRAINT "itens_plano_medida_id_fkey";

-- DropForeignKey
ALTER TABLE "itens_plano" DROP CONSTRAINT "itens_plano_refeicao_id_fkey";

-- DropForeignKey
ALTER TABLE "refeicoes" DROP CONSTRAINT "refeicoes_plano_id_fkey";

-- DropForeignKey
ALTER TABLE "reset_senha" DROP CONSTRAINT "reset_senha_nutricionista_id_fkey";

-- DropForeignKey
ALTER TABLE "sessoes" DROP CONSTRAINT "sessoes_nutricionista_id_fkey";

-- DropIndex
DROP INDEX "consentimentos_nutricionista_id_idx";

-- DropIndex
DROP INDEX "pacientes_cpf_idx";

-- DropIndex
DROP INDEX "pacientes_cpf_key";

-- DropIndex
DROP INDEX "pacientes_nutricionista_id_idx";

-- DropIndex
DROP INDEX "refeicoes_plano_id_idx";

-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "note",
ADD COLUMN     "observacao" TEXT,
DROP COLUMN "local",
ADD COLUMN     "local" "Locais" NOT NULL;

-- AlterTable
ALTER TABLE "auditoria_acessos" DROP COLUMN "atualizado_em";

-- AlterTable
ALTER TABLE "consentimentos" DROP COLUMN "atualizado_em";

-- AlterTable
ALTER TABLE "pacientes" DROP COLUMN "status",
ADD COLUMN     "status" "StatusPaciente" NOT NULL DEFAULT 'ativo';

-- AlterTable
ALTER TABLE "refeicoes" DROP COLUMN "horario",
DROP COLUMN "ordem",
DROP COLUMN "plano_id",
ADD COLUMN     "criado_por" UUID,
ADD COLUMN     "tipo" "TipoRefeicao" NOT NULL;

-- DropTable
DROP TABLE "itens_plano";

-- CreateTable
CREATE TABLE "refeicoes_planos" (
    "id" UUID NOT NULL,
    "plano_id" UUID NOT NULL,
    "refeicao_id" UUID,
    "nome" TEXT NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "categoria" "CategoriaRefeicao" NOT NULL,
    "horario" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refeicoes_planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_refeicoes_planos" (
    "id" UUID NOT NULL,
    "refeicao_plano_id" UUID NOT NULL,
    "alimento_id" UUID,
    "alimento_nome" TEXT NOT NULL,
    "gramas" DECIMAL(8,2) NOT NULL,
    "medida_id" UUID,
    "medida_descricao" TEXT,
    "quantidade_medida" DECIMAL(8,2),
    "ordem" INTEGER NOT NULL,
    "energia_kcal" DECIMAL(10,2),
    "proteina_g" DECIMAL(10,2),
    "lipidios_g" DECIMAL(10,2),
    "carboidrato_g" DECIMAL(10,2),
    "fibra_g" DECIMAL(10,2),
    "sodio_mg" DECIMAL(10,2),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_refeicoes_planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_refeicao" (
    "id" UUID NOT NULL,
    "refeicao_id" UUID NOT NULL,
    "alimento_id" UUID NOT NULL,
    "gramas" DECIMAL(8,2) NOT NULL,
    "medida_id" UUID,
    "quantidade_medida" DECIMAL(8,2),
    "ordem" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_refeicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "refeicoes_planos_plano_id_ordem_idx" ON "refeicoes_planos"("plano_id", "ordem");

-- CreateIndex
CREATE INDEX "refeicoes_planos_refeicao_id_idx" ON "refeicoes_planos"("refeicao_id");

-- CreateIndex
CREATE INDEX "itens_refeicoes_planos_refeicao_plano_id_ordem_idx" ON "itens_refeicoes_planos"("refeicao_plano_id", "ordem");

-- CreateIndex
CREATE INDEX "itens_refeicao_refeicao_id_ordem_idx" ON "itens_refeicao"("refeicao_id", "ordem");

-- CreateIndex
CREATE INDEX "auditoria_acessos_entidade_id_idx" ON "auditoria_acessos"("entidade_id");

-- CreateIndex
CREATE INDEX "auditoria_acessos_ocorrido_em_idx" ON "auditoria_acessos"("ocorrido_em");

-- CreateIndex
CREATE INDEX "consentimentos_nutricionista_id_versao_termo_idx" ON "consentimentos"("nutricionista_id", "versao_termo");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_nutricionista_id_cpf_key" ON "pacientes"("nutricionista_id", "cpf");

-- CreateIndex
CREATE INDEX "refeicoes_criado_por_idx" ON "refeicoes"("criado_por");

-- CreateIndex
CREATE UNIQUE INDEX "reset_senha_token_hash_key" ON "reset_senha"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_refresh_token_hash_key" ON "sessoes"("refresh_token_hash");

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_senha" ADD CONSTRAINT "reset_senha_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes" ADD CONSTRAINT "refeicoes_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "nutricionistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes_planos" ADD CONSTRAINT "refeicoes_planos_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes_planos" ADD CONSTRAINT "refeicoes_planos_refeicao_id_fkey" FOREIGN KEY ("refeicao_id") REFERENCES "refeicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_refeicoes_planos" ADD CONSTRAINT "itens_refeicoes_planos_refeicao_plano_id_fkey" FOREIGN KEY ("refeicao_plano_id") REFERENCES "refeicoes_planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_refeicoes_planos" ADD CONSTRAINT "itens_refeicoes_planos_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_refeicoes_planos" ADD CONSTRAINT "itens_refeicoes_planos_medida_id_fkey" FOREIGN KEY ("medida_id") REFERENCES "medidas_caseiras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_refeicao" ADD CONSTRAINT "itens_refeicao_refeicao_id_fkey" FOREIGN KEY ("refeicao_id") REFERENCES "refeicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_refeicao" ADD CONSTRAINT "itens_refeicao_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_refeicao" ADD CONSTRAINT "itens_refeicao_medida_id_fkey" FOREIGN KEY ("medida_id") REFERENCES "medidas_caseiras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
