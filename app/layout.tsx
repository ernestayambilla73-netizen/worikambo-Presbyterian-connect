import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallApp from "./components/InstallApp";

export const metadata: Metadata = {
  title: "Worikambo Presbyterian Connect",
  description: "The digital home for congregations, worship, news and resources in the Worikambo District of the Presbyterian Church of Ghana.",
  manifest: "/manifest.json",
  applicationName: "Worikambo Presbyterian Connect",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Presby Connect" },
  icons: { icon: "/pcg-connect-mark.svg", shortcut: "/pcg-connect-mark.svg", apple: "/pcg-connect-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#173f98",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function Brand() {
  return <a className="brand" href="/" aria-label="Worikambo Presbyterian Connect home">
    <img className="brand-image" src="/pcg-connect-mark.svg" width="49" height="49" alt="" />
    <span>WORIKAMBO PRESBYTERIAN<br/>CONNECT<small>PRESBYTERIAN CHURCH OF GHANA</small></span>
  </a>;
}

const nav = [
  ["Home", "/"], ["About", "/about"], ["Congregations", "/congregations"],
  ["Ministries", "/ministries"], ["Resources", "/resources"], ["News", "/news"], ["Events", "/events"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <div className="topline" />
    <header className="site-header"><div className="nav-wrap">
      <Brand />
      <nav className="nav-links" aria-label="Main navigation">
        {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        <a className="nav-cta" href="/contact">Plan a Visit <span aria-hidden="true">↗</span></a>
      </nav>
    </div></header>
    {children}
    <InstallApp />
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-content">
        <div className="footer-feature">
          <div className="footer-brand-block"><Brand /><span className="footer-kicker">FAITH · FELLOWSHIP · SERVICE</span></div>
          <p className="footer-mission">A connected church family, growing in faith and serving our communities across the Worikambo Presbyterian District.</p>
          <a className="footer-contact-cta" href="/contact"><span className="footer-cta-icon">↗</span><span><strong>Connect with us</strong><small>We would love to hear from you</small></span></a>
        </div>
        <div className="footer-column"><span className="footer-heading">Discover</span><a href="/about">About the District</a><a href="/congregations">Our Congregations</a><a href="/ministries">Church Groups & Ministries</a><a href="/events">Events & Programmes</a></div>
        <div className="footer-column"><span className="footer-heading">Faith resources</span><a href="/devotional">Daily Devotional</a><a href="/hymns">Hymns & Liturgy</a><a href="/sermons">Sermons & Messages</a><a href="/news">News & Announcements</a></div>
        <div className="footer-column"><span className="footer-heading">Helpful links</span><a href="/contact">Contact the District</a><a href="/contact#prayer">Prayer requests</a><a href="https://pcgonline.org/" target="_blank" rel="noreferrer">Presbyterian Church of Ghana <span aria-hidden="true">↗</span></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Worikambo Presbyterian Connect. All rights reserved.</span><span className="footer-bottom-right"><span className="footer-dot" /> Built for faith, community & connection <span className="footer-dot red" /></span></div>
      </div>
    </footer>
  </body></html>;
}
