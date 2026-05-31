"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bot, User, Lock, Phone, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await register({
        username,
        password,
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
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
          Join <span className="text-accent-green">Asuma MD</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Create your dashboard account</p>
      </div>

      {/* Card */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="w-4 h-4" />}
            autoComplete="username"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />

          <Input
            label="Phone Number (optional)"
            type="tel"
            placeholder="e.g. 6281234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
            autoComplete="tel"
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
            Create Account
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-bg-border text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent-green hover:text-green-400 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-700 mt-5 font-mono">
        $ asuma-md v2.0 &mdash; powered by WhatsApp API
      </p>
    </div>
  );
}
