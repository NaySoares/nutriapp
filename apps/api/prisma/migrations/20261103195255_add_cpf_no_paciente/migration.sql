/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `pacientes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pacientes" ADD COLUMN     "cpf" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE INDEX "pacientes_cpf_idx" ON "pacientes"("cpf");
