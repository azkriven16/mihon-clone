"use client";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = 24, style }: { className?: string; size?: number; style?: CSSProperties }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <Spinner size={32} style={{ color: "var(--primary)" }} />
    </div>
  );
}
