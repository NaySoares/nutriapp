import { create } from "zustand/react";
import { PatientRecord } from "@nutriapp/shared";

 interface PatientStore extends Partial<PatientRecord> {
  patient: PatientRecord | null;
  setPatient: (patient: PatientRecord) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  reset: () => void;
 }

export const usePatientStore = create<PatientStore>((set) => ({
  patient: null,
  isEditing: false,

  setIsEditing: (isEditing: boolean) => set({ isEditing }),
  setPatient: (patient: PatientRecord ) => set({ patient }),
  reset: () => set({ patient: null, isEditing: false }),
}));