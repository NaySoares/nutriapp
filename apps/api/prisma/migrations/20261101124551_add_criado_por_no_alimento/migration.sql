-- AlterTable
ALTER TABLE "alimentos" ADD COLUMN     "criado_por" UUID;

-- AddForeignKey
ALTER TABLE "alimentos" ADD CONSTRAINT "alimentos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "nutricionistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
