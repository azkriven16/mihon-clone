"use client";
import { useEffect, useState } from "react";

export const UPDATES_BADGE_KEY = "mihon-updates-badge-count";
export const UPDATES_LAST_SEEN_KEY = "mihon-updates-last-seen";

export function useUpdatesBadge(): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function readCount(): number {
      const stored = localStorage.getItem(UPDATES_BADGE_KEY);
      if (stored === null) return 0;
      return Math.max(0, parseInt(stored, 10) || 0);
    }

    setCount(readCount());

    function onStorage(e: StorageEvent) {
      if (e.key === UPDATES_BADGE_KEY) {
        setCount(Math.max(0, parseInt(e.newValue ?? "0", 10) || 0));
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return count;
}
