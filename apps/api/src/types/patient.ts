export type PatientSelect = {
  id: true;
  nutricionistaId: true;
  nome: true;
  dataNascimento: true;
  sexo: true;
  contato: true;
  anamnese: true;
  arquivadoEm: true;
  criadoEm: true;
  atualizadoEm: true;
};

export type PatientRecord = {
  id: string;
  nutricionistaId: string;
  nome: string;
  dataNascimento: Date;
  sexo: "M" | "F";
  contato: string | null;
  anamnese: string | null;
  arquivadoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
};