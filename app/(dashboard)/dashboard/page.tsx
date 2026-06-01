"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert("Redirect ke login karena tidak authenticated");
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div>Loading auth...</div>;
  if (!isAuthenticated) return null;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Dashboard Sederhana</h1>
      <p>Halo, {user?.username}</p>
      <p>Jika melihat ini, auth berhasil. Sekarang cek apakah ada alert 401 dari interceptor.</p>
      <button onClick={() => alert(`Cookie token: ${document.cookie.includes('asuma_token') ? 'ADA' : 'TIDAK ADA'}`)}>
        Cek Cookie
      </button>
    </div>
  );
}
