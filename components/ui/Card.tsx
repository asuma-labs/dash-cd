import { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ children, className, glow = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-bg-border rounded-xl p-5 transition-all duration-300",
        glow && "hover:border-accent-green/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  status?: "online" | "offline" | "connecting" | "neutral";
  subtext?: string;
}

export function StatCard({ label, value, icon, status, subtext }: StatCardProps) {
  const statusColor = {
    online: "text-accent-green",
    offline: "text-accent-red",
    connecting: "text-yellow-400",
    neutral: "text-accent-cyan",
  }[status || "neutral"];

  const dotColor = {
    online: "bg-accent-green shadow-[0_0_8px_rgba(0,255,136,0.8)]",
    offline: "bg-accent-red",
    connecting: "bg-yellow-400 animate-pulse",
    neutral: "bg-accent-cyan",
  }[status || "neutral"];

  return (
    <Card glow className="group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</p>
        {icon && <span className="text-gray-600 group-hover:text-gray-400 transition-colors">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <p className={`text-2xl font-bold font-mono ${statusColor}`}>{value}</p>
        {status && (
          <span className={`w-2 h-2 rounded-full mb-1.5 ${dotColor}`} />
        )}
      </div>
      {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
    </Card>
  );
}
