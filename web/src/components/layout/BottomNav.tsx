"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  History,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdatesBadge } from "@/lib/hooks/useUpdatesBadge";

const NAV_ITEMS = [
  { href: "/library", icon: BookOpen, label: "Library" },
  { href: "/updates", icon: RefreshCw, label: "Updates" },
  { href: "/history", icon: History, label: "History" },
  { href: "/browse", icon: Compass, label: "Browse" },
  { href: "/downloads", icon: Download, label: "Downloads" },
  { href: "/settings", icon: Settings, label: "More" },
];

export function BottomNav() {
  const pathname = usePathname();
  const updatesBadge = useUpdatesBadge();

  // Hide on reader
  if (pathname.includes("/chapter/") || pathname === "/reader") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border"
      style={{ height: "var(--bottom-nav-height)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const badge = href === "/updates" && !active ? updatesBadge : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-150",
                active ? "text-primary" : "text-text-muted"
              )}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn("transition-all duration-150", active && "scale-110")}
                />
                {badge > 0 && (
                  <span
                    aria-label={`${badge > 9 ? "9+" : badge} new update${badge === 1 ? "" : "s"}`}
                    className="absolute -top-1 -right-1.5 min-w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active ? "text-primary" : "text-text-muted")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
