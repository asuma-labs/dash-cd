// app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { botService } from "@/services/bot.service";
import { useAuth } from "@/hooks/useAuth";
import { Card, StatCard } from "@/components/ui/Card";
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

// ─── Helpers ────────────────────────────────────────────────────────────────

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
      cls: "text-accent-green bg-accent-green/10 border-accent-green/30",
      dot: "bg-accent-green shadow-[0_0_6px_rgba(0,255,136,0.8)]",
    },
    offline: {
      label: "OFFLINE",
      cls: "text-accent-red bg-red-500/10 border-red-500/30",
      dot: "bg-accent-red",
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

function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-5">
      <div className="skeleton h-3 w-24 mb-4 rounded" />
      <div className="skeleton h-7 w-32 rounded" />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [sysStats, setSysStats] = useState<SystemStats | null>(null);
  const [clones, setClones] = useState<Clone[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [status, stats, clonesData, lb] = await Promise.allSettled([
        botService.getBotStatus(),
        botService.getSystemStats(),
        botService.getClones(),
        botService.getLeaderboard(),
      ]);

      if (status.status === "fulfilled") setBotStatus(status.value);
      if (stats.status === "fulfilled") setSysStats(stats.value);
      if (clonesData.status === "fulfilled") setClones(clonesData.value);
      if (lb.status === "fulfilled") setLeaderboard(lb.value.slice(0, 10));

      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAll(false);
      intervalRef.current = setInterval(() => fetchAll(true), 30_000);
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const ram = sysStats?.ram;
  const ramPercent =
    ram?.percent ??
    (ram?.used && ram?.total
      ? Math.round((parseFloat(String(ram.used)) / parseFloat(String(ram.total))) * 100)
      : null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard
            {user && <span className="text-gray-500 font-normal text-base ml-2">— {user.username}</span>}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {lastUpdated ? `Terakhir diperbarui: ${lastUpdated.toLocaleTimeString()}` : "Memuat data..."}
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-accent-green transition-colors disabled:opacity-40 bg-bg-card border border-bg-border rounded-lg px-3 py-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <section>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" /> Status Bot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Status"
                value={botStatus?.status ?? "—"}
                icon={<Wifi className="w-4 h-4" />}
                status={botStatus?.status as "online" | "offline" | "connecting" | undefined}
              />
              <StatCard label="Uptime" value={formatUptime(botStatus?.uptime)} icon={<Clock className="w-4 h-4" />} status="neutral" />
              <StatCard label="Clones" value={botStatus?.clones ?? clones.length ?? 0} icon={<Users className="w-4 h-4" />} status="neutral" subtext="instance aktif" />
              <StatCard label="Publik" value={botStatus?.public ? "Ya" : "Tidak"} icon={<Globe className="w-4 h-4" />} status={botStatus?.public ? "online" : "offline"} />
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Server className="w-3.5 h-3.5" /> Statistik Sistem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Card glow>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Penggunaan RAM</p>
                  <MemoryStick className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-2xl font-bold font-mono text-accent-cyan mb-2">{ramPercent !== null ? `${ramPercent}%` : "—"}</p>
                {ramPercent !== null && (
                  <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ramPercent}%`, background: ramPercent > 80 ? "#ff4444" : ramPercent > 60 ? "#facc15" : "#00d4ff" }} />
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1.5">{formatBytes(ram?.used)} / {formatBytes(ram?.total)}</p>
              </Card>
              <Card glow>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">CPU</p>
                  <Cpu className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-2xl font-bold font-mono text-accent-cyan">{sysStats?.cpu?.usage !== undefined ? `${sysStats.cpu.usage}%` : "—"}</p>
                {sysStats?.cpu?.cores && <p className="text-xs text-gray-600 mt-1">{sysStats.cpu.cores} core</p>}
              </Card>
              <Card glow>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Platform</p>
                  <Terminal className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-lg font-bold font-mono text-accent-cyan capitalize truncate">{sysStats?.platform ?? sysStats?.os ?? "—"}</p>
                <div className="mt-1 space-y-0.5">
                  {sysStats?.arch && <p className="text-xs text-gray-600">Arsitektur: {sysStats.arch}</p>}
                  {sysStats?.node_version && <p className="text-xs text-gray-600">Node.js: {sysStats.node_version}</p>}
                </div>
              </Card>
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> Clone Bot <span className="text-accent-green">({clones.length})</span>
          </h2>
          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 w-32 rounded" />
                      <div className="skeleton h-2.5 w-20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : clones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <WifiOff className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-sm text-gray-600">Tidak ada clone bot ditemukan</p>
              </div>
            ) : (
              <ul className="divide-y divide-bg-border">
                {clones.map((clone, idx) => (
                  <li key={clone.id ?? idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-accent-green">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{clone.name ?? clone.phone ?? `Clone #${idx + 1}`}</p>
                      {clone.owner && <p className="text-xs text-gray-600 truncate">Pemilik: {clone.owner}</p>}
                    </div>
                    <StatusBadge status={clone.status} />
                    {clone.messages_today !== undefined && <span className="text-xs text-gray-600 font-mono">{clone.messages_today} pesan</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Papan Peringkat
          </h2>
          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-6 h-6 rounded" />
                    <div className="flex-1">
                      <div className="skeleton h-3 w-24 rounded" />
                    </div>
                    <div className="skeleton h-3 w-10 rounded" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-sm text-gray-600">Data papan peringkat kosong</p>
              </div>
            ) : (
              <ul className="divide-y divide-bg-border">
                {leaderboard.map((entry, idx) => {
                  const rank = entry.rank ?? idx + 1;
                  const score = entry.score ?? entry.messages ?? entry.points ?? 0;
                  return (
                    <li key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-sm font-bold font-mono w-6 text-center">
                        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                      </span>
                      <p className="flex-1 text-sm text-white font-medium truncate">{entry.username}</p>
                      <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-md">
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

      <footer className="pt-4 border-t border-bg-border text-center">
        <p className="text-xs text-gray-700 font-mono">
          Asuma MD Dashboard — refresh otomatis setiap 30 detik
          {" · "}
          <span className="text-accent-green/50">{process.env.NEXT_PUBLIC_API_URL}</span>
        </p>
      </footer>
    </div>
  );
}
