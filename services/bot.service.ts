import apiClient from "@/lib/axios";
import type { BotStatus, SystemStats, Clone, LeaderboardEntry } from "@/types/bot";

export const botService = {
  async getBotStatus(): Promise<BotStatus> {
    const { data } = await apiClient.get<BotStatus>("/api/bot/status");
    return data;
  },

  async getSystemStats(): Promise<SystemStats> {
    const { data } = await apiClient.get<SystemStats>("/api/system/stats");
    return data;
  },

  async getClones(): Promise<Clone[]> {
    const { data } = await apiClient.get<Clone[]>("/api/clones");
    return Array.isArray(data) ? data : [];
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data } = await apiClient.get<LeaderboardEntry[]>(
      "/api/leaderboard"
    );
    return Array.isArray(data) ? data : [];
  },
};
