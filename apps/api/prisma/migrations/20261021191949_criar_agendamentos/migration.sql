-- CreateTable
CREATE TABLE "agendamentos" (
    "id" UUID NOT NULL,
    "nutricionista_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "horario" VARCHAR(5) NOT NULL,
    "duracao" SMALLINT NOT NULL,
    "atendimento" TEXT NOT NULL,
    "tipo_consulta" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aguardando confirmação',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agendamentos_nutricionista_id_data_idx" ON "agendamentos"("nutricionista_id", "data");

-- CreateIndex
CREATE INDEX "agendamentos_paciente_id_idx" ON "agendamentos"("paciente_id");

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_nutricionista_id_fkey" FOREIGN KEY ("nutricionista_id") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
