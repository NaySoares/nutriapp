import { describe, expect, it, vi } from "vitest";
import { Readable } from "node:stream";
import { createProfileService, type LogoStorage } from "./profileService.js";
import type { AuthRepository } from "../repositories/authRepository.js";

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "nutri@example.com",
  nome: "Nutricionista",
  crn: null,
  logoPath: null
};

function createRepository(): AuthRepository {
  return {
    createNutritionist: vi.fn(),
    findNutritionistByEmail: vi.fn(),
    updatePassword: vi.fn(),
    findProfile: vi.fn().mockResolvedValue(profile),
    updateProfile: vi.fn().mockResolvedValue(profile),
    createSession: vi.fn(),
    findValidSession: vi.fn(),
    findSessionOwner: vi.fn().mockResolvedValue(profile.id),
    rotateSession: vi.fn(),
    revokeSession: vi.fn(),
    createPasswordReset: vi.fn(),
    findValidPasswordReset: vi.fn(),
    claimPasswordReset: vi.fn(),
    revokeSessions: vi.fn(),
    createPatient: vi.fn(),
    listPatients: vi.fn(),
    findPatient: vi.fn(),
    updatePatient: vi.fn(),
    archivePatient: vi.fn(),
    findNutritionistSettings: vi.fn(),
    findPatientOwner: vi.fn(),
    createMeasurement: vi.fn(),
    listMeasurements: vi.fn(),
    findMeasurement: vi.fn(),
    updateMeasurement: vi.fn(),
    deleteMeasurement: vi.fn(),
    findSettings: vi.fn(),
    updateSettings: vi.fn(),
    createAppointment: vi.fn(),
    listAppointments: vi.fn(),
    findAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    deleteAppointment: vi.fn(),
    findConflicts: vi.fn()
  };
}

describe("profile service", () => {
  it("persiste a chave da logo enviada para o armazenamento", async () => {
    const repository = createRepository();
    const storage: LogoStorage = {
      upload: vi.fn().mockResolvedValue("logos/111/logo.png")
    };
    const service = createProfileService(repository, storage);

    await service.uploadLogo("session-id", {
      filename: "logo.png",
      mimetype: "image/png",
      file: Readable.from(["logo"])
    });

    expect(storage.upload).toHaveBeenCalledWith(expect.objectContaining({
      nutritionistId: profile.id,
      filename: "logo.png",
      mimetype: "image/png"
    }));
    expect(repository.updateProfile).toHaveBeenCalledWith(profile.id, {
      logoPath: "logos/111/logo.png"
    });
  });
});
