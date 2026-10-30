"use client";
import { useState } from "react";
export default function GalleryDownloadButton({ url, title }: { url: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function download() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error("Download unavailable");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeName = (title || "peace-congregation-photo").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "church-photo";
      const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : blob.type.includes("gif") ? "gif" : "jpg";
      anchor.href = objectUrl; anchor.download = safeName + "." + extension;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      setMessage("Photo download started.");
    } catch {
      setMessage("Direct download is unavailable. Open the photo and use your browser's Save image option.");
      window.open(url, "_blank", "noopener,noreferrer");
    } finally { setBusy(false); }
  }
  return <div className="gallery-download-wrap">
    <button type="button" className="gallery-download-button" onClick={download} disabled={busy} aria-label={`Download ${title}`}>{busy ? "Preparing photo…" : "↓ Download photo"}</button>
    <span className="gallery-download-status" role="status" aria-live="polite">{message}</span>
  </div>;
}
