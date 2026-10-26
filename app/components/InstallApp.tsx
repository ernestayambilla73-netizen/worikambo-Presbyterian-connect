"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallApp() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The website remains usable if the browser blocks service workers.
      });
    }
    const media = window.matchMedia("(display-mode: standalone)");
    if (media.matches || (navigator as Navigator & { standalone?: boolean }).standalone) setInstalled(true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setMessage("App installed successfully.");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (installed) {
      setMessage("Worikambo Presbyterian Connect is already installed.");
      return;
    }
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);
      setMessage(choice.outcome === "accepted" ? "Thanks — follow the browser prompts to finish installing." : "Installation was cancelled. You can try again any time.");
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
    setMessage("On Android, open your browser menu (⋮) and choose “Install app” or “Add to Home screen”. If that option is missing, open this site in Chrome and try again after the page finishes loading.");
  }

  if (installed) return null;

  return <aside className="install-app" aria-label="Install app">
    <div className="install-app-copy"><img src="/pcg-connect-mark.svg" alt="" width="38" height="38"/><span><strong>Take the church with you</strong><small>Install Presbyterian Connect on your phone</small></span></div>
    <button type="button" className="install-app-button" onClick={install}>{installed ? "App installed" : "Install app"}</button>
    {message && <p className="install-app-message" role="status">{message}</p>}
  </aside>;
}
