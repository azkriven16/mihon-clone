"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  RefreshCw,
  History,
  Download,
  BarChart2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { isDesktopRuntime } from "@/lib/desktop";
import { useUpdatesBadge } from "@/lib/hooks/useUpdatesBadge";

const PRIMARY_NAV = [
  { href: "/library", icon: BookOpen, label: "Library" },
  { href: "/browse", icon: Compass, label: "Browse" },
  { href: "/updates", icon: RefreshCw, label: "Updates" },
  { href: "/history", icon: History, label: "History" },
  { href: "/downloads", icon: Download, label: "Downloads" },
] as const;

const SECONDARY_NAV = [
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const updatesBadge = useUpdatesBadge();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isDesktopRuntime()) return null;

  const w = collapsed ? "w-16" : "w-60";

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${w} flex flex-col z-50 transition-[width] duration-200`}
      style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}
      aria-label="Primary navigation"
    >
      {/* Logo / branding */}
      <div
        className="flex items-center h-14 shrink-0 px-3 gap-2 overflow-hidden"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <rect x="1" y="3" width="10" height="13" rx="1.5" fill="var(--primary)" opacity="0.35" />
          <rect x="4" y="1" width="10" height="13" rx="1.5" fill="var(--primary)" opacity="0.6" />
          <rect x="7" y="4" width="10" height="13" rx="1.5" fill="var(--primary)" />
        </svg>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold tracking-tight leading-tight" style={{ color: "var(--text)" }}>Mihon</span>
            <span className="text-[11px]" style={{ color: "var(--text-muted, var(--text-secondary))" }}>v0.1.0</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`${collapsed ? "mx-auto" : "ml-auto"} shrink-0 p-1 rounded-md transition-colors hover:bg-elevated`}
          style={{ color: "var(--text-secondary)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 pt-2 flex-1 overflow-y-auto overflow-x-hidden">
        {PRIMARY_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const badge = href === "/updates" && !active ? updatesBadge : 0;

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg mx-2 text-sm font-medium transition-colors duration-150 ${collapsed ? "px-3 justify-center" : "px-4"}`}
              style={{
                background: active ? "var(--bg-elevated)" : "transparent",
                color: active ? "var(--primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative shrink-0">
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {collapsed && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                )}
              </div>
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && badge > 0 && (
                <span
                  aria-label={`${badge > 9 ? "9+" : badge} new update${badge === 1 ? "" : "s"}`}
                  className="min-w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1.5 leading-none shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary nav */}
      <nav
        className="flex flex-col gap-0.5 pb-3 mt-auto shrink-0 overflow-x-hidden"
        style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}
      >
        {SECONDARY_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg mx-2 text-sm font-medium transition-colors duration-150 ${collapsed ? "px-3 justify-center" : "px-4"}`}
              style={{
                background: active ? "var(--bg-elevated)" : "transparent",
                color: active ? "var(--primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
