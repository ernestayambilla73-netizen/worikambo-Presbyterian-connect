import type { SVGProps } from "react";

type IconName = "newspaper" | "images" | "church" | "calendar" | "users" | "mail" | "settings" | "user" | "home" | "cross" | "music" | "sun" | "arrow-up-right" | "book-open" | "menu" | "bell" | "heart" | "map-pin" | "phone" | "search" | "chevron-right" | "check-circle" | "shield" | "download" | "clock" | "camera" | "file-text" | "hand-heart";

const paths: Record<IconName, React.ReactNode> = {
  newspaper: <><path d="M4 4.5h13a2 2 0 0 1 2 2V20H5a3 3 0 0 1-3-3V6.5a2 2 0 0 1 2-2Z"/><path d="M7 8h8M7 11h8M7 14h5"/><path d="M19 8h3v9a3 3 0 0 1-3 3"/></>,
  images: <><rect x="3" y="4" width="15" height="15" rx="2"/><path d="m3 15 4-4 4 4 2-2 5 5"/><circle cx="13" cy="8" r="1.5"/><path d="M7 4V2h14v15h-3"/></>,
  church: <><path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M12 2v7M9 5h6M9 13h6M12 13v8"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z"/></>,
  cross: <path d="M10 3h4v6h6v4h-6v8h-4v-8H4V9h6Z"/>,
  music: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
  "arrow-up-right": <><path d="M7 17 17 7M7 7h10v10"/></>,
  "book-open": <><path d="M12 7v14M3 5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v13h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3Z"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
  "map-pin": <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.9L7.7 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.9-.6l2.8.5a2 2 0 0 1 1.7 2.6Z"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  "chevron-right": <path d="m9 18 6-6-6-6"/>,
  "check-circle": <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  camera: <><path d="M14 5 15.5 7H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5L10 5Z"/><circle cx="12" cy="13" r="3.5"/></>,
  "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  "hand-heart": <><path d="M8 14 3 9l-2 2 7 7a4 4 0 0 0 3 1h4a4 4 0 0 0 3-1l5-5a2 2 0 0 0-3-3l-4 3"/><path d="M8 14h5a2 2 0 0 0 0-4h-2c-2 0-3-2-5-2"/></>
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}
