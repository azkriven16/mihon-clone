"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useGlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      // Don't fire with modifier keys (except shift for ? help)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case "1":
          router.push("/library");
          break;
        case "2":
          router.push("/browse");
          break;
        case "3":
          router.push("/updates");
          break;
        case "4":
          router.push("/history");
          break;
        case "5":
          router.push("/downloads");
          break;
        case ",":
          router.push("/settings");
          break;
        case "?": {
          // Toggle help overlay — dispatch a custom event
          window.dispatchEvent(new CustomEvent("toggle-shortcuts-help"));
          break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);
}
