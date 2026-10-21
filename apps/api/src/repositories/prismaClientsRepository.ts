import type { AuthPrisma } from "../types/auth.js";
import { MeasurementRecord, MeasurementSelect } from "../types/measurement.js";

type Formula = "mifflin" | "harris_benedict";

export type ProfileClient = {
  nutricionista: {
    findUnique: (args: {
      where: { id: string };
      select: { id: true; email: true; nome: true; crn: true; logoPath: true };
    }) => Promise<{
      id: string;
      email: string;
      nome: string;
      crn: string | null;
      logoPath: string | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: { nome?: string; crn?: string | null; logoPath?: string };
      select: { id: true; email: true; nome: true; crn: true; logoPath: true };
    }) => Promise<{
      id: string;
      email: string;
      nome: string;
      crn: string | null;
      logoPath: string | null;
    }>;
  };
};

export type SettingsClient = {
  nutricionista: {
    findUnique: (args: {
      where: { id: string };
      select: { formulaPadrao: true; fatoresAtividade: true };
    }) => Promise<{ formulaPadrao: Formula; fatoresAtividade: unknown } | null>;
    update: (args: {
      where: { id: string };
      data: { formulaPadrao: Formula; fatoresAtividade: Record<string, number> };
      select: { formulaPadrao: true; fatoresAtividade: true };
    }) => Promise<{ formulaPadrao: Formula; fatoresAtividade: unknown }>;
  };
};

export type MeasurementClient = {
  paciente: {
    findFirst: (args: {
      where: { id: string; nutricionistaId: string };
      select: { id: true; dataNascimento: true; sexo: true };
    }) => Promise<{ id: string; dataNascimento: Date; sexo: "M" | "F" } | null>;
  };
  medicao: {
    create: (args: { data: Record<string, unknown>; select: MeasurementSelect }) => Promise<MeasurementRecord>;
    findMany: (args: {
      where: { pacienteId: string };
      orderBy: { data: "desc" };
      select: MeasurementSelect;
    }) => Promise<MeasurementRecord[]>;
    findFirst: (args: { where: { id: string }; select: MeasurementSelect }) => Promise<MeasurementRecord | null>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: MeasurementSelect;
    }) => Promise<MeasurementRecord>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
};

export const asProfileClient = (prisma: AuthPrisma) => prisma as unknown as ProfileClient;
export const asSettingsClient = (prisma: AuthPrisma) => prisma as unknown as SettingsClient;
export const asMeasurementClient = (prisma: AuthPrisma) => prisma as unknown as MeasurementClient;