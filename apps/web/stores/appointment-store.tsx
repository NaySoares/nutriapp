import { create } from "zustand";
import type { PatientRecord } from "@nutriapp/shared";

interface AppointmentContext {
  patient: PatientRecord | null;
  setPatient: (patient: PatientRecord | null) => void;
  clearPatient: () => void;
}

export const useAppointmentContext = create<AppointmentContext>(
  (set) => ({
    patient: null,
    setPatient: (patient) => set({ patient }),
    clearPatient: () => set({ patient: null }),
  })
);