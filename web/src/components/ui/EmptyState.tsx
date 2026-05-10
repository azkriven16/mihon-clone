"use client";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[300px]">
      <div className="text-[var(--text-muted)] opacity-60">{icon}</div>
      <div>
        <p className="text-[var(--text)] font-semibold text-base">{title}</p>
        {description && (
          <p className="text-[var(--text-secondary)] text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
