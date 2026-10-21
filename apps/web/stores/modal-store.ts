import { create } from "zustand";
import type { ReactNode } from "react";

type ModalStore = {
  content: ReactNode | null;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  content: null,

  openModal: (content) => set({ content }),

  closeModal: () => set({ content: null }),
}));