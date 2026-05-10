"use client";
import { useEffect } from "react";

export function useWindowTitle(title: string) {
  useEffect(() => {
    if (!title) return;
    document.title = title;
    // In Tauri, also update the native window title
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
        getCurrentWindow().setTitle(title).catch(() => {});
      });
    }
  }, [title]);
}
