"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isDesktopRuntime } from "@/lib/desktop";

const SHORTCUTS = [
  { keys: ["1"], description: "Go to Library" },
  { keys: ["2"], description: "Go to Browse" },
  { keys: ["3"], description: "Go to Updates" },
  { keys: ["4"], description: "Go to History" },
  { keys: ["5"], description: "Go to Downloads" },
  { keys: [","], description: "Settings" },
  { keys: ["?"], description: "Show this help" },
  { keys: ["←", "→"], description: "Previous / next page (in reader)" },
  { keys: ["Esc"], description: "Close overlays" },
] as const;

export function ShortcutsHelp() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [open, setOpen] = useState(false);

  // SSR-safe desktop detection
  useEffect(() => {
    setIsDesktop(isDesktopRuntime());
  }, []);

  // Listen for the toggle custom event
  useEffect(() => {
    const onToggle = () => setOpen((prev) => !prev);
    window.addEventListener("toggle-shortcuts-help", onToggle);
    return () => window.removeEventListener("toggle-shortcuts-help", onToggle);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Only render on desktop runtime and when open
  if (!isDesktop || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.5)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      {/* Inner card */}
      <div
        className="bg-[var(--bg-surface)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text)" }}
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Close shortcuts help"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcut rows */}
        <ul className="space-y-2.5">
          {SHORTCUTS.map(({ keys, description }) => (
            <li
              key={description}
              className="flex items-center justify-between gap-4"
            >
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {description}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-0.5 text-xs font-mono"
                    style={{ color: "var(--text)" }}
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
