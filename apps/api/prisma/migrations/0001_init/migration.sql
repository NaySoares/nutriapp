CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FormulaPadrao" AS ENUM ('mifflin', 'harris_benedict');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "FonteAlimento" AS ENUM ('taco', 'usda');

-- CreateTable
CREATE TABLE "nutricionistas" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "crn" TEXT,
    "logo_path" TEXT,
    "formula_padrao" "FormulaPadrao" NOT NULL DEFAULT 'mifflin',
    "fatores_atividade" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutricionistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" UUID NOT NULL,
    "nutricionista_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "revogada_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_senha" (
    "id" UUID NOT NULL,
    "nutricionista_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reset_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" UUID NOT NULL,
    "nutricionista_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "contato" TEXT,
    "anamnese" TEXT,
    "arquivado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicoes" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "peso_kg" DECIMAL(8,2) NOT NULL,
    "altura_cm" DECIMAL(8,2) NOT NULL,
    "circunferencias" JSONB,
    "nivel_atividade" TEXT NOT NULL,
    "tmb_kcal" DECIMAL(10,2) NOT NULL,
    "get_kcal" DECIMAL(10,2) NOT NULL,
    "imc" DECIMAL(8,2) NOT NULL,
    "formula_usada" "FormulaPadrao" NOT NULL,
    "fator_usado" DECIMAL(5,3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alimentos" (
    "id" UUID NOT NULL,
    "fonte" "FonteAlimento" NOT NULL,
    "id_externo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_busca" TEXT NOT NULL,
    "grupo" TEXT,
    "energia_kcal" DECIMAL(10,2),
    "proteina_g" DECIMAL(10,2),
    "lipidio_g" DECIMAL(10,2),
    "carboidrato_g" DECIMAL(10,2),
    "fibra_g" DECIMAL(10,2),
    "sodio_mg" DECIMAL(10,2),
    "outros" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medidas_caseiras" (
    "id" UUID NOT NULL,
    "alimento_id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "gramas" DECIMAL(8,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medidas_caseiras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "meta_kcal" DECIMAL(10,2),
    "versao_de" UUID,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refeicoes" (
    "id" UUID NOT NULL,
    "plano_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "horario" TEXT,
    "ordem" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refeicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_plano" (
    "id" UUID NOT NULL,
    "refeicao_id" UUID NOT NULL,
    "alimento_id" UUID NOT NULL,
    "gramas" DECIMAL(8,2) NOT NULL,
    "medida_id" UUID,
    "quantidade_medida" DECIMAL(8,2),
    "ordem" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimentos" (
    "id" UUID NOT NULL,
    "nutricionista_id" UUID NOT NULL,
    "versao_termo" TEXT NOT NULL,
    "aceito_em" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consentimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_acessos" (
    "id" UUID NOT NULL,
    "nutricionista_id" UUID NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" UUID NOT NULL,
    "ocorrido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditoria_acessos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutricionistas_email_key" ON "nutricionistas"("email");

-- CreateIndex
CREATE INDEX "sessoes_nutricionista_id_idx" ON "sessoes"("nutricionista_id");

-- CreateIndex
CREATE INDEX "reset_senha_nutricionista_id_idx" ON "reset_senha"("nutricionista_id");

-- CreateIndex
CREATE INDEX "pacientes_nutricionista_id_idx" ON "pacientes"("nutricionista_id");

-- CreateIndex
CREATE INDEX "medicoes_paciente_id_idx" ON "medicoes"("paciente_id");

-- CreateIndex
CREATE INDEX "alimentos_nome_busca_idx" ON "alimentos"("nome_busca");

-- CreateIndex
CREATE UNIQUE INDEX "alimentos_fonte_id_externo_key" ON "alimentos"("fonte", "id_externo");

-- CreateIndex
CREATE INDEX "medidas_caseiras_alimento_id_idx" ON "medidas_caseiras"("alimento_id");

-- CreateIndex
CREATE INDEX "planos_paciente_id_idx" ON "planos"("paciente_id");

-- CreateIndex
CREATE INDEX "refeicoes_plano_id_idx" ON "refeicoes"("plano_id");

-- CreateIndex
CREATE INDEX "itens_plano_refeicao_id_idx" ON "itens_plano"("refeicao_id");

-- CreateIndex
CREATE INDEX "consentimentos_nutricionista_id_idx" ON "consentimentos"("nutricionista_id");

-- CreateIndex
CREATE INDEX "auditoria_acessos_nutricionista_id_idx" ON "auditoria_acessos"("nutricionista_id");

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_senha" ADD CONSTRAINT "reset_senha_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicoes" ADD CONSTRAINT "medicoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medidas_caseiras" ADD CONSTRAINT "medidas_caseiras_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos" ADD CONSTRAINT "planos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos" ADD CONSTRAINT "planos_versao_de_fkey" FOREIGN KEY ("versao_de") REFERENCES "planos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes" ADD CONSTRAINT "refeicoes_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_plano" ADD CONSTRAINT "itens_plano_refeicao_id_fkey" FOREIGN KEY ("refeicao_id") REFERENCES "refeicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_plano" ADD CONSTRAINT "itens_plano_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_plano" ADD CONSTRAINT "itens_plano_medida_id_fkey" FOREIGN KEY ("medida_id") REFERENCES "medidas_caseiras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimentos" ADD CONSTRAINT "consentimentos_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_acessos" ADD CONSTRAINT "auditoria_acessos_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
