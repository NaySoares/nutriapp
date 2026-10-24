/*
  Warnings:

  - The `status` column on the `agendamentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `paciente_contato` to the `agendamentos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `atendimento` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo_consulta` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Locais" AS ENUM ('consultorio', 'online', 'hospital');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('confirmada', 'aguardando_confirmacao', 'concluida', 'falta', 'cancelada');

-- CreateEnum
CREATE TYPE "Atendimentos" AS ENUM ('particular', 'hospitalar');

-- CreateEnum
CREATE TYPE "TiposConsulta" AS ENUM ('consulta_de_retorno', 'avaliacao_nutricional', 'acompanhamento', 'revisao_de_plano', 'primeira_consulta');

-- AlterEnum
ALTER TYPE "FonteAlimento" ADD VALUE 'manual';

-- DropForeignKey
ALTER TABLE "agendamentos" DROP CONSTRAINT "agendamentos_paciente_id_fkey";

-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "paciente_contato" TEXT NOT NULL,
ALTER COLUMN "paciente_id" DROP NOT NULL,
DROP COLUMN "atendimento",
ADD COLUMN     "atendimento" "Atendimentos" NOT NULL,
DROP COLUMN "tipo_consulta",
ADD COLUMN     "tipo_consulta" "TiposConsulta" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusAgendamento" NOT NULL DEFAULT 'aguardando_confirmacao',
ALTER COLUMN "paciente_nome" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
