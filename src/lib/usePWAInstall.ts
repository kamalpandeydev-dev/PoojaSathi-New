import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstall {
  canInstall: boolean; // true when the browser's install prompt is capturable
  isInstalled: boolean; // true when running as standalone PWA
  isIOS: boolean; // iOS needs manual "Add to Home Screen" instructions
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
  dismiss: () => void; // user dismissed the banner — hide it
}

export function usePWAInstall(): PWAInstall {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return !!sessionStorage.getItem("ps_install_dismissed");
    } catch {
      return false;
    }
  });

  const isInstalled =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(navigator as { standalone?: boolean }).standalone;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  }

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("ps_install_dismissed", "1");
    } catch {
      /* */
    }
  }

  const canInstall = !isInstalled && !dismissed && (!!deferredPrompt || isIOS);

  return { canInstall, isInstalled, isIOS, install, dismiss };
}
