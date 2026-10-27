"use client";

import { useState } from "react";
import Icon from "./Icon";

type QuickAccessProps = { admin?: boolean };

const publicLinks = [
  { label: "Latest news", href: "/news", icon: "newspaper" },
  { label: "Photo gallery", href: "/gallery", icon: "images" },
  { label: "Ministries & fellowships", href: "/ministries", icon: "cross" },
  { label: "Events & programmes", href: "/events", icon: "calendar" },
  { label: "Congregations", href: "/congregations", icon: "church" },
  { label: "Contact the district", href: "/contact", icon: "mail" },
];

export default function QuickAccess({ admin = false }: QuickAccessProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`quick-access ${admin ? "quick-access-admin" : ""}`}>
      <button
        type="button"
        className="quick-access-trigger" aria-label="Open quick access menu" title="Quick access"
        aria-expanded={open}
        aria-controls={admin ? "admin-quick-access-menu" : "home-quick-access-menu"}
        onClick={() => setOpen(value => !value)}
      >
        <Icon name="menu" size={22} strokeWidth={2.1} className={`quick-access-menu-icon ${open ? "is-open" : ""}`} /><span className="quick-access-label">Quick Access</span>
      </button>
      {open && (
        <nav id={admin ? "admin-quick-access-menu" : "home-quick-access-menu"} className="quick-access-menu" aria-label="Quick access links">
          {publicLinks.map(link => (
            <a href={link.href} key={link.href}><span className="quick-access-link-icon"><Icon name={link.icon as "newspaper" | "images" | "cross" | "calendar" | "church" | "mail"} size={18} /></span><span className="quick-access-link-label">{link.label}</span><Icon name="arrow-up-right" size={15} className="quick-access-link-arrow" /></a>
          ))}
          {admin ? (
            <a href="/admin/members"><span className="quick-access-link-icon"><Icon name="users" size={18} /></span><span className="quick-access-link-label">Member register</span><Icon name="arrow-up-right" size={15} className="quick-access-link-arrow" /></a>
          ) : (
            <a href="/admin"><span className="quick-access-link-icon"><Icon name="settings" size={18} /></span><span className="quick-access-link-label">Administrator sign in</span><Icon name="arrow-up-right" size={15} className="quick-access-link-arrow" /></a>
          )}
        </nav>
      )}
    </div>
  );
}
