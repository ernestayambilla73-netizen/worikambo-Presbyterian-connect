"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

const TABLES = [
  "church_admins", "church_congregations", "church_courses", "church_gallery",
  "church_member_groups", "church_members", "church_ministries", "church_page_content",
  "church_posts", "church_resources", "pcms_attendance", "pcms_audit_log",
  "pcms_communications", "pcms_documents", "pcms_equipment", "pcms_events",
  "pcms_finance", "pcms_pastoral_care", "pcms_prayer_requests", "pcms_records",
  "pcms_reminders", "pcms_visitors", "pcms_volunteers"
] as const;

export default function BackupPage() {
  const supabase = useMemo(() => createClient(), []);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { setChecking(false); return; }
      setSessionEmail(session.user.email || "");
      const { data, error: roleError } = await supabase.from("church_admins").select("user_id,role").eq("user_id", session.user.id).maybeSingle();
      if (!active) return;
      setAuthorized(!roleError && !!data && ["admin", "administrator"].includes(String(data.role || "").toLowerCase()));
      if (roleError) setError("Could not verify administrator access: " + roleError.message);
      setChecking(false);
    })();
    return () => { active = false; };
  }, [supabase]);

  async function exportBackup() {
    if (!window.confirm("This export contains confidential member, finance, pastoral-care and church records. Save it only in a secure location accessible to authorised church leaders. Continue?")) return;
    setBusy(true); setError(""); setNotice(""); setProgress("Preparing secure export…");
    try {
      const tables: Record<string, unknown[]> = {};
      let totalRows = 0;
      for (const table of TABLES) {
        setProgress("Exporting " + table.replaceAll("_", " ") + "…");
        const collected: unknown[] = [];
        let start = 0;
        while (true) {
          const { data, error: queryError } = await supabase.from(table).select("*").range(start, start + 999);
          if (queryError) throw new Error("Could not export " + table + ": " + queryError.message);
          const batch = data || [];
          collected.push(...batch);
          if (batch.length < 1000) break;
          start += 1000;
        }
        tables[table] = collected;
        totalRows += collected.length;
      }
      const payload = {
        product: "PEACE (SUMALISM) CONGREGATION",
        exportType: "database-records-only",
        exportedAt: new Date().toISOString(),
        tableCount: TABLES.length,
        totalRows,
        note: "This file contains database rows only. It does not contain the actual image/document files in Supabase Storage, user passwords, or authentication secrets. Store securely. Restore should be performed by a project owner after checking foreign-key dependencies.",
        tables
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "peace-congregation-database-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setNotice("Backup export created: " + totalRows + " records across " + TABLES.length + " tables. Keep a second copy in a separate secure location.");
      setProgress("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The backup could not be completed. No partial file was downloaded.");
      setProgress("");
    } finally { setBusy(false); }
  }

  if (checking) return <main className="admin-shell"><div className="container admin-container"><section className="member-panel">Checking administrator access…</section></div></main>;
  if (!authorized) return <main className="admin-shell"><div className="container admin-container"><section className="member-panel"><h1>Data backup</h1><p>Sign in with an approved administrator account to export church records.</p>{error && <p className="admin-error" role="alert">{error}</p>}<a className="btn" href="/admin">Go to administrator sign in</a></section></div></main>;

  return <main className="admin-shell"><div className="container admin-container">
    <div className="member-top"><div><span className="eyebrow">RECORD SAFETY & RECOVERY</span><h1>Church data backup</h1><p>Download a secure copy of the church database records for safekeeping.</p></div><div className="member-top-actions"><a className="btn btn-secondary" href="/admin">← Administrator home</a></div></div>
    <section className="member-panel">
      <h2>Export all church records</h2>
      <p>The export includes member registration, groups, attendance, visitors, finance, church operations, published content and audit records from the central database.</p>
      <div className="notice blue"><strong>Important:</strong> This JSON file contains confidential personal and financial information. Save it to an encrypted or otherwise access-controlled location. Do not share it in WhatsApp groups or public cloud folders.</div>
      <div className="notice"><strong>Photos and documents:</strong> Supabase Storage keeps uploaded files separately from database rows. This export records their database references but does not download the actual files.</div>
      <div className="member-editor-actions"><button type="button" className="btn" onClick={exportBackup} disabled={busy}>{busy ? "Preparing backup…" : "Download complete records backup"}</button></div>
      {progress && <p className="admin-muted" role="status" aria-live="polite">{progress}</p>}
      {notice && <p className="admin-success" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </section>
    <p className="admin-footnote">This is a manual export, not an automatic scheduled backup or one-click restore. Keep copies in at least two secure locations and periodically test that the project owner can restore the database and retrieve stored media.</p>
    <p className="admin-footnote">Signed in as {sessionEmail || "approved administrator"}.</p>
  </div></main>;
}
