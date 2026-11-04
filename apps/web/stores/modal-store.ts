import { create } from "zustand";
import type { ReactNode } from "react";

type ModalStore = {
  content: ReactNode | null;
  openModal: (content: ReactNode, type?: "default" | "side") => void;
  closeModal: () => void;
  type: "default" | "side";
  setType: (type: "default" | "side") => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  content: null,
  type: "default",

  setType: (type) => set({ type }),

  openModal: (content, type = "default") => set({ content, type }),

  closeModal: () => set({ content: null }),
}));