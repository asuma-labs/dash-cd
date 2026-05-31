export interface BotStatus {
  status: "online" | "offline" | "connecting";
  uptime?: number | string;
  clones?: number;
  public?: boolean;
  version?: string;
  message?: string;
}

export interface SystemStats {
  platform?: string;
  ram?: {
    total?: number | string;
    used?: number | string;
    free?: number | string;
    percent?: number;
  };
  cpu?: {
    usage?: number;
    cores?: number;
  };
  uptime?: number | string;
  os?: string;
  arch?: string;
  node_version?: string;
}

export interface Clone {
  id: string | number;
  name?: string;
  phone?: string;
  status?: "online" | "offline" | "connecting";
  owner?: string;
  created_at?: string;
  messages_today?: number;
}

export interface LeaderboardEntry {
  rank?: number;
  username: string;
  score?: number;
  messages?: number;
  points?: number;
}
