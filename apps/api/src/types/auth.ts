import { MeasurementRecord, MeasurementSelect } from "./measurement";
import { PatientRecord, PatientSelect } from "@nutriapp/shared";

export type AuthPrisma = {
  nutricionista: {
    create: (args: {
      data: {
        email: string;
        senhaHash: string;
        nome: string;
        fatoresAtividade: Record<string, number>;
      };
      select: { id: true; email: true; nome: true };
    }) => Promise<{ id: string; email: string; nome: string }>;
    findUnique: (args: {
      where: { email: string };
      select: { id: true; email: true; nome: true; senhaHash: true };
    }) => Promise<{ id: string; email: string; nome: string; senhaHash: string } | null>;
    update: (args: {
      where: { id: string };
      data: { senhaHash: string } | { nome: string; crn: string | null };
    }) => Promise<unknown>;
  };
  sessao: {
    create: (args: {
      data: { nutricionistaId: string; refreshTokenHash: string; expiraEm: Date };
    }) => Promise<{ id: string; nutricionistaId: string }>;
    findFirst: (args: {
      where: {
        refreshTokenHash: string;
        revogadaEm: null;
        expiraEm: { gt: Date };
      };
      select: { id: true; nutricionistaId: true };
    }) => Promise<{ id: string; nutricionistaId: string } | null>;
    findUnique: (args: {
      where: { id: string; revogadaEm: null; expiraEm: { gt: Date } };
      select: { nutricionistaId: true };
    }) => Promise<{ nutricionistaId: string } | null>;
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<{ count: number }>;
  };
  resetSenha: {
    create: (args: {
      data: { nutricionistaId: string; tokenHash: string; expiraEm: Date };
    }) => Promise<unknown>;
    findFirst: (args: {
      where: { tokenHash: string; usadoEm: null; expiraEm: { gt: Date } };
      select: { id: true; nutricionistaId: true };
    }) => Promise<{ id: string; nutricionistaId: string } | null>;
    updateMany: (args: {
      where: { id: string; tokenHash: string; usadoEm: null };
      data: { usadoEm: Date };
    }) => Promise<{ count: number }>;
  };
  paciente: {
    create: (args: {
      data: {
        nutricionistaId: string;
        nome: string;
        dataNascimento: Date;
        sexo: "M" | "F";
        contato?: string;
        anamnese?: string;
      };
      select: PatientSelect;
    }) => Promise<PatientRecord>;
    findMany: (args: {
      where: { nutricionistaId: string; arquivadoEm?: Date | null; nome?: { contains: string; mode: "insensitive" } };
      orderBy: { nome: "asc" };
      select: PatientSelect;
    }) => Promise<PatientRecord[]>;

    findFirst: (args: {
      where: { id: string; nutricionistaId: string };
      select: PatientSelect;
    }) => Promise<PatientRecord | null>;

    updateMany: (args: {
      where: { id: string; nutricionistaId: string; arquivadoEm?: null };
      data: { nome?: string; dataNascimento?: Date; sexo?: "M" | "F"; contato?: string | null; anamnese?: string | null; arquivadoEm?: Date };
    }) => Promise<{ count: number }>;
  };
  medicao?: {
    create: (args: { data: Record<string, unknown>; select: MeasurementSelect }) => Promise<MeasurementRecord>;
    findMany: (args: { where: { pacienteId: string }; orderBy: { data: "desc" }; select: MeasurementSelect }) => Promise<MeasurementRecord[]>;
    findFirst: (args: { where: { id: string }; select: MeasurementSelect }) => Promise<MeasurementRecord | null>;
    update: (args: { where: { id: string }; data: Record<string, unknown>; select: MeasurementSelect }) => Promise<MeasurementRecord>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
};
