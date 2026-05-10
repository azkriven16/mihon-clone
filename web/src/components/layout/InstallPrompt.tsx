"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

// Declare BeforeInstallPromptEvent interface for TypeScript strict mode
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  showPrompt: boolean;
  installed: boolean;
  dismissed: boolean;
}

const DISMISSAL_KEY = "install_prompt_dismissed";
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function InstallPrompt() {
  const [state, setState] = useState<InstallPromptState>({
    deferredPrompt: null,
    showPrompt: false,
    installed: false,
    dismissed: false,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check if user has dismissed the prompt recently
    const dismissedData = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedData) {
      try {
        const dismissedTime = JSON.parse(dismissedData);
        const now = Date.now();
        if (now - dismissedTime < DISMISSAL_DURATION) {
          setState((prev) => ({ ...prev, dismissed: true }));
          return;
        }
      } catch {
        // Invalid data, clear and continue
        localStorage.removeItem(DISMISSAL_KEY);
      }
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setState((prev) => ({
        ...prev,
        deferredPrompt: promptEvent,
        showPrompt: true,
        dismissed: false,
      }));
    };

    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        showPrompt: false,
        installed: true,
        deferredPrompt: null,
      }));
      // Clear dismissal data on successful install
      localStorage.removeItem(DISMISSAL_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!state.deferredPrompt) return;

    try {
      state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setState((prev) => ({
          ...prev,
          showPrompt: false,
          deferredPrompt: null,
        }));
      } else {
        // User dismissed the browser prompt, keep banner for later
        setState((prev) => ({
          ...prev,
          deferredPrompt: null,
        }));
      }
    } catch (error) {
      console.error("Install prompt error:", error);
      setState((prev) => ({
        ...prev,
        deferredPrompt: null,
      }));
    }
  };

  const handleDismiss = () => {
    setState((prev) => ({
      ...prev,
      showPrompt: false,
      dismissed: true,
      deferredPrompt: null,
    }));
    // Persist dismissal with timestamp
    localStorage.setItem(DISMISSAL_KEY, JSON.stringify(Date.now()));
  };

  // Only render if mounted and conditions are met
  if (!isMounted || !state.showPrompt || !state.deferredPrompt || state.installed || state.dismissed) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 bg-primary text-white p-3 flex items-center justify-between gap-3 animate-slide-down"
      role="banner"
      aria-label="Install Mihon app"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Download size={20} className="flex-shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">Install Mihon</p>
          <p className="text-xs opacity-90 truncate">Read manga offline, add to home screen</p>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-white text-primary font-medium text-xs rounded-md hover:opacity-90 active:opacity-80 transition-opacity"
          aria-label="Install Mihon to home screen"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 hover:opacity-80 active:opacity-60 transition-opacity"
          aria-label="Dismiss install prompt"
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
