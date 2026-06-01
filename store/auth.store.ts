import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';

interface AuthStore {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    hydrateFromStorage: (token: string | null, user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isLoading: true,
            isAuthenticated: false,

            setAuth: (token, user) => set({ 
                token, 
                user, 
                isAuthenticated: true, 
                isLoading: false 
            }),

            clearAuth: () => set({ 
                token: null, 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            hydrateFromStorage: (token, user) => set({ 
                token, 
                user, 
                isAuthenticated: !!token && !!user, 
                isLoading: false 
            }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
/*import { create } from "zustand";
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
*/
