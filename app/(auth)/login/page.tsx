"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bot, User, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await login({ identifier, password });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Invalid credentials. Please try again.";
      setError(message);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-green/10 border border-accent-green/30 mb-4">
          <Bot className="w-7 h-7 text-accent-green" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Asuma <span className="text-accent-green">MD</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to your dashboard</p>
      </div>

      {/* Card */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username or Phone"
            type="text"
            placeholder="Enter your username or phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={<User className="w-4 h-4" />}
            autoComplete="username"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-accent-red bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-bg-border text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-accent-green hover:text-green-400 font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Terminal hint */}
      <p className="text-center text-xs text-gray-700 mt-5 font-mono">
        $ asuma-md v2.0 &mdash; powered by WhatsApp API
      </p>
    </div>
  );
}
