"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { setToken, getToken, removeToken, syncTokenFromCookieToStorage } from "@/lib/auth";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const { token, user, isLoading, isAuthenticated, setAuth, clearAuth, setLoading, hydrateFromStorage } =
    useAuthStore();

  // Hydrate from storage on mount (no redirect inside)
  useEffect(() => {
    syncTokenFromCookieToStorage();
    const storedToken = getToken();

    if (storedToken) {
      // Restore minimal auth state; no API call needed
      hydrateFromStorage(storedToken, user);
    } else {
      hydrateFromStorage(null, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for 401 unauthorized event from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
      router.push("/login");
    };

    window.addEventListener("asuma:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("asuma:unauthorized", handleUnauthorized);
  }, [clearAuth, router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const data = await authService.login(payload);
        setToken(data.token);
        setAuth(data.token, data.user);
        router.push("/dashboard");
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setAuth, setLoading, router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      try {
        const data = await authService.register(payload);
        setToken(data.token);
        setAuth(data.token, data.user);
        router.push("/dashboard");
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setAuth, setLoading, router]
  );

  const logout = useCallback(() => {
    removeToken();
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
