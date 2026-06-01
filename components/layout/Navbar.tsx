"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  LogOut,
  Bot,
  Menu,
  X,
  Gamepad2,
  Wrench,
  MessageSquare,
  Radio,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/game", label: "Game", icon: Gamepad2 },
    { href: "/tools", label: "Tools", icon: Wrench },
    { href: "/chatbots", label: "Chatbots", icon: MessageSquare },
    { href: "/jadibot", label: "Jadibot", icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-border bg-bg-secondary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/30 flex items-center justify-center group-hover:border-accent-green/60 transition-all">
              <Bot className="w-4 h-4 text-accent-green" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">Asuma</span>
              <span className="text-accent-green font-bold tracking-tight"> MD</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? "bg-accent-green/10 text-accent-green"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-green/20 border border-accent-green/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent-green">
                    {user.username?.[0]?.toUpperCase() ?? "U"}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{user.username}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-accent-red gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-bg-border py-3 space-y-1 animate-fade-in">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? "bg-accent-green/10 text-accent-green"
                    : "text-gray-500 hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Signed in as <span className="text-gray-300">{user.username}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-accent-red"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
