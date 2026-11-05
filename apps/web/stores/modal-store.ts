import { create } from "zustand";
import type { ReactNode } from "react";

export type ModalType = "default" | "side";

export type ModalOptions = {
  title?: string;
  width?: string;
  closeOnOverlay?: boolean;
};

export type ModalEntry = {
  id: string;
  content: ReactNode;
  type: ModalType;
  options: ModalOptions;
};

type ModalStore = {
  modalStack: ModalEntry[];

  openModal: (
    content: ReactNode,
    type?: ModalType,
    options?: ModalOptions
  ) => void;

  closeModal: () => void;
  closeAllModals: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modalStack: [],

  openModal: (content, type = "default", options = {}) => {
    set((state) => ({
      modalStack: [
        ...state.modalStack,
        {
          id: crypto.randomUUID(),
          content,
          type,
          options,
        },
      ],
    }));
  },

  closeModal: () => {
    set((state) => ({
      modalStack: state.modalStack.slice(0, -1),
    }));
  },

  closeAllModals: () => {
    set({ modalStack: [] });
  },
}));