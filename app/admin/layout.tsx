import Link from "next/link";
import Icon from "../components/Icon";
import "./admin.css";
const links=[
 {label:"Overview",href:"/admin",icon:"layout-dashboard"},
 {label:"Members",href:"/admin/members",icon:"users"},
 {label:"Visitors",href:"/admin/visitors",icon:"user-plus"},
 {label:"Management",href:"/admin/management",icon:"settings"},
 {label:"Quick desk",href:"/admin/quick-desk",icon:"clipboard-list"},
 {label:"Backups",href:"/admin/backup",icon:"database"},
];
export default function AdminLayout({children}:{children:React.ReactNode}) {
 return <div className="admin-portal">
  <aside className="admin-sidebar">
   <Link href="/admin" className="admin-brand"><img src="/api/pcg-crest" alt="" /><span><strong>PEACE CONGREGATION</strong><small>ADMINISTRATION PORTAL</small></span></Link>
   <div className="admin-side-label">WORKSPACE</div>
   <nav aria-label="Administration navigation">{links.map(item=><Link key={item.href} href={item.href} className="admin-side-link"><Icon name={item.icon} size={18}/><span>{item.label}</span></Link>)}</nav>
  </aside>
  <div className="admin-main">
   <header className="admin-topbar"><div><span className="admin-topbar-kicker">PRESBYTERIAN CHURCH OF GHANA</span><strong>Church Administration</strong></div></header>
   <main className="admin-content">{children}</main>
  </div>
 </div>;
}
