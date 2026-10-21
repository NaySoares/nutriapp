import type { AuthPrisma } from "../types/auth";
import { createMeasurementRepository, type MeasurementRepository } from "./measurementRepository";
import { createNutritionistRepository, type NutritionistRepository } from "./nutritionistRepository";
import { createPasswordResetRepository, type PasswordResetRepository } from "./passwordResetRepository";
import { createPatientRepository, type PatientRepository } from "./patientRepository";
import { createSessionRepository, type SessionRepository } from "./sessionRepository";
import { createSettingsRepository, type SettingsRepository } from "./settingsRepository";
import { createAppointmentRepository, type AppointmentRepository } from "./appointmentRepository";

export type AuthRepository = NutritionistRepository &
  SessionRepository &
  PasswordResetRepository &
  PatientRepository &
  MeasurementRepository &
  SettingsRepository &
  AppointmentRepository;

export function createAuthRepository(prisma: AuthPrisma): AuthRepository {
  return {
    ...createNutritionistRepository(prisma),
    ...createSessionRepository(prisma),
    ...createPasswordResetRepository(prisma),
    ...createPatientRepository(prisma),
    ...createMeasurementRepository(prisma),
    ...createSettingsRepository(prisma),
    ...createAppointmentRepository(prisma),
  };
}