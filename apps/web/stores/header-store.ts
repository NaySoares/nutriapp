import { create } from "zustand";
import type { ReactNode } from "react";

type HeaderConfig = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

type HeaderStore = {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
  reset: () => void;
};

const defaultConfig: HeaderConfig = {
  title: "Dashboard",
};

export const useHeaderStore = create<HeaderStore>((set) => ({
  config: defaultConfig,
  setConfig: (config) => set({ config }),
  reset: () => set({ config: defaultConfig }),
}));