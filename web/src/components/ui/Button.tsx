"use client";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[var(--primary-dim)] text-white hover:bg-[var(--primary)] active:scale-[0.97]",
  secondary: "bg-[var(--bg-elevated)] text-[var(--text)] hover:bg-[var(--bg-card)] active:scale-[0.97]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] active:scale-[0.97]",
  danger: "bg-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger)]/30 active:scale-[0.97]",
  outline: "bg-transparent border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-elevated)] active:scale-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-[var(--radius-sm)]",
  md: "h-10 px-4 text-sm rounded-[var(--radius)]",
  lg: "h-12 px-6 text-base rounded-[var(--radius)]",
  icon: "h-10 w-10 rounded-full flex items-center justify-center",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={16} /> : children}
    </button>
  );
}
