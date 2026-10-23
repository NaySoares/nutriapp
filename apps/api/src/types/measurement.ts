import type { Prisma } from "@prisma/client";

export type MeasurementSelect = {
  id: true;
  pacienteId: true;
  data: true;
  pesoKg: true;
  alturaCm: true;
  circunferencias: true;
  nivelAtividade: true;
  tmbKcal: true;
  getKcal: true;
  imc: true;
  formulaUsada: true;
  fatorUsado: true;
  criadoEm: true;
  atualizadoEm: true;
};

export type MeasurementRecord = {
  id: string;
  pacienteId: string;
  data: Date;
  pesoKg: Prisma.Decimal;
  alturaCm: Prisma.Decimal;
  circunferencias: Prisma.JsonValue | null;
  nivelAtividade: string;
  tmbKcal: Prisma.Decimal;
  getKcal: Prisma.Decimal;
  imc: Prisma.Decimal;
  formulaUsada: string;
  fatorUsado: Prisma.Decimal;
  criadoEm: Date;
  atualizadoEm: Date;
};