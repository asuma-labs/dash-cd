"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { botService } from "@/services/bot.service";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { BotStatus, SystemStats, Clone, LeaderboardEntry } from "@/types/bot";
import {
  Activity,
  Cpu,
  Server,
  Users,
  Wifi,
  WifiOff,
  Clock,
  RefreshCw,
  Trophy,
  Phone,
  MemoryStick,
  Terminal,
  Globe,
} from "lucide-react";

function formatUptime(raw?: number | string): string {
  if (!raw) return "—";
  const seconds = typeof raw === "string" ? parseInt(raw, 10) : raw;
  if (isNaN(seconds)) return String(raw);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function formatBytes(raw?: number | string): string {
  if (raw === undefined || raw === null) return "—";
  const n = typeof raw === "string" ? parseFloat(raw) : raw;
  if (isNaN(n)) return String(raw);
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(1)} GB`;
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    online: {
      label: "ONLINE",
      cls: "text-green-400 bg-green-400/10 border-green-400/30",
      dot: "bg-green-400 shadow-[0_0_6px_rgba(0,255,136,0.8)]",
    },
    offline: {
      label: "OFFLINE",
      cls: "text-red-400 bg-red-500/10 border-red-500/30",
      dot: "bg-red-400",
    },
    connecting: {
      label: "CONNECTING",
      cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
      dot: "bg-yellow-400 animate-pulse",
    },
  };
  const cfg = map[status ?? "offline"] ?? map.offline;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md border ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon, status }: { label: string; value: string | number; icon: React.ReactNode; status?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</p>
        <div className="text-gray-600">{icon}</div>
      </div>
      <p className="text-2xl font-bold font-mono text-cyan-400">{value}</p>
      {status && <StatusBadge status={status} />}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-gray-900 border border-gray-800 rounded-xl ${className}`}>{children}</div>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isConnected: wsConnected, lastMessage } = useWebSocket();
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [sysStats, setSysStats] = useState<SystemStats | null>(null);
  const [clones, setClones] = useState<Clone[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (lastMessage?.type === "bot_status") {
      setBotStatus(lastMessage.data);
      setLastUpdated(new Date());
    }
    if (lastMessage?.type === "system_stats") {
      setSysStats(lastMessage.data);
    }
    if (lastMessage?.type === "clones") {
      setClones(lastMessage.data);
    }
  }, [lastMessage]);

  const fetchAll = useCallback(async (silent = false) => {
    if (!isAuthenticated) return;

    if (!silent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const [status, stats, clonesData, lb] = await Promise.allSettled([
        botService.getBotStatus(),
        botService.getSystemStats(),
        botService.getClones(),
        botService.getLeaderboard(),
      ]);

      if (status.status === "fulfilled") setBotStatus(status.value);
      else console.error("Bot Status error:", status.reason);
      
      if (stats.status === "fulfilled") setSysStats(stats.value);
      else console.error("System Stats error:", stats.reason);
      
      if (clonesData.status === "fulfilled") setClones(clonesData.value);
      else console.error("Clones error:", clonesData.reason);
      
      if (lb.status === "fulfilled") setLeaderboard(lb.value.slice(0, 10));
      else console.error("Leaderboard error:", lb.reason);

      const allRejected = [status, stats, clonesData, lb].every(r => r.status === "rejected");
      if (allRejected) {
        setErrorMessage("Gagal mengambil data dari server. Mungkin server sedang offline atau koneksi bermasalah.");
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("FetchAll error:", err);
      setErrorMessage("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAll(false);
      intervalRef.current = setInterval(() => fetchAll(true), 30000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [authLoading, isAuthenticated, fetchAll]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const ram = sysStats?.ram;
  const ramPercent = ram?.percent ?? (ram?.used && ram?.total
    ? Math.round((parseFloat(String(ram.used)) / parseFloat(String(ram.total))) * 100)
    : null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard
            {user && (
              <span className="text-gray-500 font-normal text-base ml-2">
                — {user.username}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-gray-600">
              {lastUpdated
                ? `Terakhir diperbarui: ${lastUpdated.toLocaleTimeString()}`
                : "Memuat data..."}
            </p>
            {wsConnected ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Real-time
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                Polling
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-cyan-400 transition-colors disabled:opacity-40 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      <section>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Status Bot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Status" value={botStatus?.status ?? "—"} icon={<Wifi className="w-4 h-4" />} status={botStatus?.status} />
          <StatCard label="Uptime" value={formatUptime(botStatus?.uptime)} icon={<Clock className="w-4 h-4" />} />
          <StatCard label="Clones" value={botStatus?.clones ?? clones.length ?? 0} icon={<Users className="w-4 h-4" />} />
          <StatCard label="Publik" value={botStatus?.public ? "Ya" : "Tidak"} icon={<Globe className="w-4 h-4" />} status={botStatus?.public ? "online" : "offline"} />
        </div>
      </section>

      <section>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Server className="w-3.5 h-3.5" />
          Statistik Sistem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Penggunaan RAM</p>
              <MemoryStick className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-400 mb-2">
              {ramPercent !== null ? `${ramPercent}%` : "—"}
            </p>
            {ramPercent !== null && (
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${ramPercent}%`,
                    background: ramPercent > 80 ? "#ff4444" : ramPercent > 60 ? "#facc15" : "#00d4ff",
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1.5">
              {formatBytes(ram?.used)} / {formatBytes(ram?.total)}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">CPU</p>
              <Cpu className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-400">
              {sysStats?.cpu?.usage !== undefined ? `${sysStats.cpu.usage}%` : "—"}
            </p>
            {sysStats?.cpu?.cores && (
              <p className="text-xs text-gray-600 mt-1">{sysStats.cpu.cores} core</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Platform</p>
              <Terminal className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-lg font-bold font-mono text-cyan-400 capitalize truncate">
              {sysStats?.platform ?? sysStats?.os ?? "—"}
            </p>
            <div className="mt-1 space-y-0.5">
              {sysStats?.arch && <p className="text-xs text-gray-600">Arsitektur: {sysStats.arch}</p>}
              {sysStats?.node_version && <p className="text-xs text-gray-600">Node.js: {sysStats.node_version}</p>}
            </div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            Clone Bot <span className="text-cyan-400">({clones.length})</span>
          </h2>
          <Card className="overflow-hidden p-0">
            {clones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <WifiOff className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-sm text-gray-600">Tidak ada clone bot ditemukan</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {clones.map((clone, idx) => (
                  <li key={clone.id ?? idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-400">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {clone.name ?? clone.phone ?? clone.id ?? `Clone #${idx + 1}`}
                      </p>
                      {clone.owner && <p className="text-xs text-gray-600 truncate">Pemilik: {clone.owner}</p>}
                    </div>
                    <StatusBadge status={clone.status} />
                    {clone.messages_today !== undefined && (
                      <span className="text-xs text-gray-600 font-mono">{clone.messages_today} pesan</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" />
            Papan Peringkat
          </h2>
          <Card className="overflow-hidden p-0">
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-sm text-gray-600">Data papan peringkat kosong</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {leaderboard.map((entry, idx) => {
                  const rank = entry.rank ?? idx + 1;
                  const score = entry.score ?? entry.messages ?? entry.points ?? 0;
                  return (
                    <li key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-sm font-bold font-mono w-6 text-center">
                        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                      </span>
                      <p className="flex-1 text-sm text-white font-medium truncate">{entry.username}</p>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md">
                        {score.toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>
      </div>

      <footer className="pt-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-700 font-mono">
          Asuma MD Dashboard — {wsConnected ? "WebSocket connected" : "Polling every 30s"}
          {" · "}
          <span className="text-cyan-400/50">{process.env.NEXT_PUBLIC_API_URL}</span>
        </p>
      </footer>
    </div>
  );
}
