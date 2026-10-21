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
  pesoKg: number | string;
  alturaCm: number | string;
  circunferencias: unknown;
  nivelAtividade: string;
  tmbKcal: number | string;
  getKcal: number | string;
  imc: number | string;
  formulaUsada: "mifflin" | "harris_benedict";
  fatorUsado: number | string;
  criadoEm: Date;
  atualizadoEm: Date;
};