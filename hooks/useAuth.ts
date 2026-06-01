"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { setToken, getToken, removeToken } from "@/lib/auth";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { token, user, isLoading, isAuthenticated, setAuth, clearAuth, setLoading, hydrateFromStorage } =
    useAuthStore();

  useEffect(() => {
    setIsClient(true);
    const storedToken = getToken();
    let storedUser = null;
    try {
      const rawUser = localStorage.getItem("asuma_user");
      if (rawUser) storedUser = JSON.parse(rawUser);
    } catch (e) {}
    hydrateFromStorage(storedToken, storedUser);
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isClient) return;
    const handleUnauthorized = () => {
      console.log("401 detected, logging out");
      removeToken();
      localStorage.removeItem("asuma_user");
      clearAuth();
      router.push("/login");
    };
    window.addEventListener("asuma:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("asuma:unauthorized", handleUnauthorized);
  }, [isClient, clearAuth, router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const data = await authService.login(payload);
        setToken(data.token);
        localStorage.setItem("asuma_user", JSON.stringify(data.user));
        setAuth(data.token, data.user);
        router.push("/dashboard");
      } catch (err) {
        console.error("Login error", err);
        setLoading(false);
        throw err;
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
        localStorage.setItem("asuma_user", JSON.stringify(data.user));
        setAuth(data.token, data.user);
        router.push("/dashboard");
      } catch (err) {
        console.error("Register error", err);
        setLoading(false);
        throw err;
      }
    },
    [setAuth, setLoading, router]
  );

  const updateUser = useCallback(
    (updatedUser: Partial<User>) => {
      const newUser = { ...user, ...updatedUser } as User;
      localStorage.setItem("asuma_user", JSON.stringify(newUser));
      if (token) {
        setAuth(token, newUser);
      }
    },
    [user, token, setAuth]
  );

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem("asuma_user");
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  return { token, user, isLoading, isAuthenticated, login, register, logout, updateUser };
}
