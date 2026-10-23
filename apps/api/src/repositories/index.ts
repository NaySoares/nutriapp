
import type { PrismaClient } from "@prisma/client";

import { createNutritionistRepository } from "./nutritionistRepository";
import { createSessionRepository } from "./sessionRepository";
import { createPasswordResetRepository } from "./passwordResetRepository";
import { createPatientRepository } from "./patientRepository";
import { createMeasurementRepository } from "./measurementRepository";
import { createSettingsRepository } from "./settingsRepository";
import { createAppointmentRepository } from "./appointmentRepository";
import { createFoodRepository } from "./foodRepository";

export function createRepositories(prisma: PrismaClient) {
  return {
    nutritionists: createNutritionistRepository(prisma),
    sessions: createSessionRepository(prisma),
    passwordResets: createPasswordResetRepository(prisma),
    patients: createPatientRepository(prisma),
    measurements: createMeasurementRepository(prisma),
    settings: createSettingsRepository(prisma),
    appointments: createAppointmentRepository(prisma),
    foods: createFoodRepository(prisma),
  };
}
