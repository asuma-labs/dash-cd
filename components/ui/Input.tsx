import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-400 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-bg-card border border-bg-border text-white placeholder-gray-600 rounded-lg",
              "focus:outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/30",
              "transition-all duration-200",
              "text-sm py-2.5 px-4",
              icon && "pl-10",
              error && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-accent-red mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
