"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "peace-congregation-welcome-seen-v1";
const GREETING = "May the peace of the Lord be with you";

export default function WelcomeNotification() {
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!("Notification" in window)) setPermission("unsupported");
    else setPermission(Notification.permission);

    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "true") {
        setVisible(true);
        window.localStorage.setItem(STORAGE_KEY, "true");
      }
    } catch {
      setVisible(true);
    }
  }, []);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setStatus("This browser does not support phone notifications. You can still read the welcome message here.");
      return;
    }
    try {
      const result = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      setPermission(result);
      if (result !== "granted") {
        setStatus(result === "denied"
          ? "Notifications are blocked in your browser settings. You can enable them there later."
          : "Notifications were not enabled. You can continue using the app.");
        return;
      }
      setStatus("Notifications are enabled on this device. Publish a news item from the admin dashboard to test a notification on this device.");
    } catch {
      setStatus("We could not enable notifications on this device. Please check your browser settings.");
    }
  }

  if (!visible) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="peace-welcome-title" style={{
      position: "fixed", inset: 0, zIndex: 10000, display: "grid", placeItems: "center",
      padding: 20, background: "rgba(8, 22, 45, .68)", backdropFilter: "blur(5px)"
    }}>
      <section style={{
        width: "min(100%, 430px)", borderRadius: 22, padding: "30px 24px",
        background: "#fff", color: "#172b49", textAlign: "center",
        boxShadow: "0 24px 80px rgba(0,0,0,.28)"
      }}>
        <img src="/api/pcg-crest" alt="Presbyterian Church of Ghana crest" width="76" height="76"
          style={{ objectFit: "contain", margin: "0 auto 16px" }} />
        <p style={{ margin: "0 0 8px", color: "#9a7130", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>
          A WARM CHURCH WELCOME
        </p>
        <h2 id="peace-welcome-title" style={{ margin: "0 0 12px", fontSize: 25, lineHeight: 1.25 }}>
          May the peace of the Lord be with you
        </h2>
        <p style={{ margin: "0 0 22px", color: "#53627a", lineHeight: 1.65 }}>
          Welcome to PEACE (SUMALISM) CONGREGATION of the Presbyterian Church of Ghana. We are glad you are here.
        </p>
        <button type="button" onClick={enableNotifications} style={{
          width: "100%", border: 0, borderRadius: 12, padding: "14px 18px",
          background: "#173f78", color: "#fff", fontWeight: 700, cursor: "pointer"
        }}>
          {permission === "granted" ? "Send me church notifications" : "Enable phone notifications"}
        </button>
        <button type="button" onClick={() => setVisible(false)} style={{
          width: "100%", marginTop: 10, border: "1px solid #d9e0ea", borderRadius: 12,
          padding: "12px 18px", background: "#fff", color: "#243650", fontWeight: 650, cursor: "pointer"
        }}>
          Continue to the church app
        </button>
        {status && <p role="status" style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.5, color: "#53627a" }}>{status}</p>}
        <p style={{ margin: "16px 0 0", fontSize: 11, color: "#7a8799" }}>
          You can change notification permission at any time in your browser settings.
        </p>
      </section>
    </div>
  );
}
