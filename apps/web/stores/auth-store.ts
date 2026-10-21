import { User } from "@nutriapp/shared";
import { create } from "zustand";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));