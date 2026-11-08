/*
  Warnings:

  - Added the required column `nome` to the `itens_refeicao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itens_refeicao" ADD COLUMN     "nome" TEXT NOT NULL;
