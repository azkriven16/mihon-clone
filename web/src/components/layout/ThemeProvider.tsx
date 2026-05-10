"use client";
import { useEffect } from "react";
import { useSettings } from "@/lib/store/settings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("theme-light", "theme-amoled");
    if (settings.theme !== "dark") {
      html.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme]);

  return <>{children}</>;
}
