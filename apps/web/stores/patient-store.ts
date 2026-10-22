import { create } from "zustand/react";
import { PatientRecord } from "@nutriapp/shared";

 interface PatientStore extends Partial<PatientRecord> {
  patient: PatientRecord | null;
  setPatient: (patient: PatientRecord) => void;
  setNome: (nome: string) => void;
  setDataNascimento: (dataNascimento: Date) => void;
  setSexo: (sexo: "M" | "F") => void;
  setContato: (contato: PatientRecord["contato"]) => void;
  setAnamnese: (anamnese: PatientRecord["anamnese"]) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
 }

export const usePatientStore = create<PatientStore>((set) => ({
  nome: "",
  dataNascimento: new Date(),
  sexo: undefined,
  contato: null,
  anamnese: null,
  patient: null,
  isEditing: false,

  setIsEditing: (isEditing: boolean) => set({ isEditing }),
  setNome: (nome: string) => set({ nome }),
  setDataNascimento: (dataNascimento: Date) => set({ dataNascimento }),
  setSexo: (sexo: "M" | "F") => set({ sexo }),
  setContato: (contato: PatientRecord["contato"]) => set({ contato }),
  setAnamnese: (anamnese: PatientRecord["anamnese"]) => set({ anamnese }),
  setPatient: (patient: PatientRecord ) => {
    console.log("setPatient called with:", patient);
    set({ patient: patient });
    set({ isEditing: true });
  }
}));