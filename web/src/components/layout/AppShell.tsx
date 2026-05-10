"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { isDesktopRuntime } from "@/lib/desktop";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomNav } from "./BottomNav";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { useGlobalShortcuts } from "@/lib/hooks/useGlobalShortcuts";

const COLLAPSED_KEY = "mihon-sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useGlobalShortcuts();

  useEffect(() => {
    setIsDesktop(isDesktopRuntime());
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  if (pathname === "/") return <>{children}</>;

  if (isDesktop) {
    const sidebarW = collapsed ? "ml-16" : "ml-60";
    return (
      <div className="flex h-full">
        <DesktopSidebar collapsed={collapsed} onToggle={handleToggle} />
        <main
          className={`flex-1 ${sidebarW} overflow-y-auto min-h-full max-w-none transition-[margin] duration-200`}
          style={{ minHeight: "100vh" }}
        >
          {children}
        </main>
        <ShortcutsHelp />
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col pb-safe">
        {children}
      </main>
      <BottomNav />
      <ShortcutsHelp />
    </>
  );
}
