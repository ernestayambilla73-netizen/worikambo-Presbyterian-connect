"use client";

import { useState } from "react";

type QuickAccessProps = { admin?: boolean };

const publicLinks = [
  { label: "Latest news", href: "/news", icon: "▤" },
  { label: "Photo gallery", href: "/gallery", icon: "▧" },
  { label: "Ministries & fellowships", href: "/ministries", icon: "✝" },
  { label: "Events & programmes", href: "/events", icon: "▦" },
  { label: "Congregations", href: "/congregations", icon: "⌂" },
  { label: "Contact the district", href: "/contact", icon: "✉" },
];

export default function QuickAccess({ admin = false }: QuickAccessProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`quick-access ${admin ? "quick-access-admin" : ""}`}>
      <button
        type="button"
        className="quick-access-trigger"
        aria-expanded={open}
        aria-controls={admin ? "admin-quick-access-menu" : "home-quick-access-menu"}
        onClick={() => setOpen(value => !value)}
      >
        <span aria-hidden="true">⚡</span> Quick Access <span className="quick-access-chevron" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <nav id={admin ? "admin-quick-access-menu" : "home-quick-access-menu"} className="quick-access-menu" aria-label="Quick access links">
          {publicLinks.map(link => (
            <a href={link.href} key={link.href}><span aria-hidden="true">{link.icon}</span>{link.label}<span aria-hidden="true">↗</span></a>
          ))}
          {admin ? (
            <a href="/admin/members"><span aria-hidden="true">♙</span>Member register<span aria-hidden="true">↗</span></a>
          ) : (
            <a href="/admin"><span aria-hidden="true">⚙</span>Administrator sign in<span aria-hidden="true">↗</span></a>
          )}
        </nav>
      )}
    </div>
  );
}
