import apiClient from "@/lib/axios";
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/api/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/api/register",
      payload
    );
    return data;
  },

  async getUser(id: string | number): Promise<AuthResponse["user"]> {
    const { data } = await apiClient.get(`/api/user/${id}`);
    return data;
  },
};
