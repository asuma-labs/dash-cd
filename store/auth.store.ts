import { create } from "zustand";
import type { User, AuthState } from "@/types/auth";

interface AuthStore extends AuthState {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hydrateFromStorage: (token: string | null, user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (token, user) =>
    set({ token, user, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ token: null, user: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  hydrateFromStorage: (token, user) =>
    set({
      token,
      user,
      isAuthenticated: !!token,
      isLoading: false,
    }),
}));
