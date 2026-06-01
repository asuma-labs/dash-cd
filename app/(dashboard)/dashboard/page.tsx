"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { botService } from "@/services/bot.service";
import { Card, StatCard } from "@/components/ui/Card";
import type { BotStatus, SystemStats, Clone, LeaderboardEntry } from "@/types/bot";
import {
  Activity, Cpu, Server, Users, Wifi, WifiOff, Clock, RefreshCw,
  Trophy, Phone, MemoryStick, Terminal, Globe,
} from "lucide-react";

// Helper functions (sama seperti kode aslimu)
function formatUptime(raw?: number | string): string { /* ... */ }
function formatBytes(raw?: number | string): string { /* ... */ }
function StatusBadge({ status }: { status?: string }) { /* ... */ }
function SkeletonCard() { /* ... */ }

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [sysStats, setSysStats] = useState<SystemStats | null>(null);
  const [clones, setClones] = useState<Clone[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect hanya jika auth sudah selesai dan tidak authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fungsi fetch API dengan error handling yang aman
  const fetchAll = useCallback(async (silent = false) => {
    if (!isAuthenticated) return; // jangan fetch jika belum auth
    
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setApiError(null);

    try {
      // Jalankan semua request, tangkap error masing-masing
      const results = await Promise.allSettled([
        botService.getBotStatus(),
        botService.getSystemStats(),
        botService.getClones(),
        botService.getLeaderboard(),
      ]);

      // Proses hasil
      if (results[0].status === "fulfilled") setBotStatus(results[0].value);
      else console.warn("GetBotStatus error:", results[0].reason);
      
      if (results[1].status === "fulfilled") setSysStats(results[1].value);
      else console.warn("GetSystemStats error:", results[1].reason);
      
      if (results[2].status === "fulfilled") setClones(results[2].value);
      else console.warn("GetClones error:", results[2].reason);
      
      if (results[3].status === "fulfilled") setLeaderboard(results[3].value.slice(0, 10));
      else console.warn("GetLeaderboard error:", results[3].reason);

      // Jika semua gagal, tampilkan pesan error umum
      if (results.every(r => r.status === "rejected")) {
        setApiError("Gagal mengambil data dari server. Periksa koneksi atau coba lagi nanti.");
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setApiError("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Panggil fetch hanya jika auth sudah siap dan authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAll(false);
      intervalRef.current = setInterval(() => fetchAll(true), 30000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [authLoading, isAuthenticated, fetchAll]);

  // Tampilkan loading auth
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

  if (!isAuthenticated) return null; // sedang redirect

  // Render dashboard (sama seperti kode aslimu, tambahkan pesan error jika ada)
  const ram = sysStats?.ram;
  const ramPercent = ram?.percent ?? (ram?.used && ram?.total ? Math.round((Number(ram.used) / Number(ram.total)) * 100) : null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
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

      {/* Pesan error jika ada */}
      {apiError && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          ⚠️ {apiError}
        </div>
      )}

      {/* ── Bot Status Cards ── (sama seperti kode aslimu) */}
      <section>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Status Bot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Status" value={botStatus?.status ?? "—"} icon={<Wifi className="w-4 h-4" />} status={botStatus?.status as any} />
              <StatCard label="Uptime" value={formatUptime(botStatus?.uptime)} icon={<Clock className="w-4 h-4" />} status="neutral" />
              <StatCard label="Clones" value={botStatus?.clones ?? clones.length ?? 0} icon={<Users className="w-4 h-4" />} status="neutral" subtext="instance aktif" />
              <StatCard label="Publik" value={botStatus?.public ? "Ya" : "Tidak"} icon={<Globe className="w-4 h-4" />} status={botStatus?.public ? "online" : "offline"} />
            </>
          )}
        </div>
      </section>

      {/* ── System Stats ── */}
      <section>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Server className="w-3.5 h-3.5" />
          Statistik Sistem
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

      {/* ── Clone Bots + Leaderboard ── (sama, tapi tambahkan penanganan error) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> Clone Bot <span className="text-accent-green">({clones.length})</span>
          </h2>
          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="p-5 space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
            ) : clones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12"><WifiOff className="w-8 h-8 text-gray-700 mb-2" /><p className="text-sm text-gray-600">Tidak ada clone bot ditemukan</p></div>
            ) : (
              <ul className="divide-y divide-bg-border">
                {clones.map((clone, idx) => (
                  <li key={clone.id ?? idx} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center justify-center"><span className="text-xs font-bold text-accent-green">{idx+1}</span></div>
                    <div className="flex-1"><p className="text-sm font-medium text-white truncate">{clone.name ?? clone.phone ?? `Clone #${idx+1}`}</p>{clone.owner && <p className="text-xs text-gray-600 truncate">Pemilik: {clone.owner}</p>}</div>
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
              <div className="p-5 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-8 rounded" />)}</div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12"><Trophy className="w-8 h-8 text-gray-700 mb-2" /><p className="text-sm text-gray-600">Data papan peringkat kosong</p></div>
            ) : (
              <ul className="divide-y divide-bg-border">
                {leaderboard.map((entry, idx) => {
                  const rank = entry.rank ?? idx+1;
                  const score = entry.score ?? entry.messages ?? entry.points ?? 0;
                  return (
                    <li key={idx} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-sm font-bold font-mono w-6 text-center">{rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : `#${rank}`}</span>
                      <p className="flex-1 text-sm text-white font-medium truncate">{entry.username}</p>
                      <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-md">{score.toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>
      </div>
      <footer className="pt-4 border-t border-bg-border text-center"><p className="text-xs text-gray-700 font-mono">Asuma MD Dashboard — refresh otomatis setiap 30 detik</p></footer>
    </div>
  );
}
