/*
  Warnings:

  - Made the column `contato` on table `pacientes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pacientes" ALTER COLUMN "contato" SET NOT NULL;
