import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallApp from "./components/InstallApp";
import WelcomeNotification from "./components/WelcomeNotification";
import QuickAccess from "../components/QuickAccess";
import Icon from "../components/Icon";

export const metadata: Metadata = {
  title: "PEACE (SUMALISM) CONGREGATION | Presbyterian Church of Ghana",
  description: "The digital home of PEACE (SUMALISM) CONGREGATION of the Presbyterian Church of Ghana.",
  manifest: "/manifest.json",
  applicationName: "PEACE (SUMALISM) CONGREGATION",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PEACE (SUMALISM) CONGREGATION" },
  icons: { icon: [{ url: "/api/pcg-crest", type: "image/png" }], shortcut: ["/api/pcg-crest"], apple: [{ url: "/api/pcg-crest", type: "image/png" }] },
};

export const viewport: Viewport = {
  themeColor: "#102b54",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function Brand() {
  return <a className="brand" href="/" aria-label="PEACE (SUMALISM) CONGREGATION home">
    <img className="brand-image" src="/api/pcg-crest" width="49" height="49" alt="Presbyterian Church of Ghana crest" />
    <span>PEACE<br/>(SUMALISM)<br/>CONGREGATION<small>PRESBYTERIAN CHURCH OF GHANA</small></span>
  </a>;
}

const nav = [
  ["Home", "/"], ["About", "/about"], ["Ministries", "/ministries"],
  ["Worship", "/sunday-service"], ["Events", "/events"], ["News", "/news"],
  ["Gallery", "/gallery"], ["Resources", "/resources"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <div className="topline" />
    <header className="site-header"><div className="nav-wrap">
      <Brand />
      <nav className="nav-links" aria-label="Main navigation">
        {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        <a className="nav-cta" href="/contact">Plan a Visit <Icon name="arrow-up-right" size={15} /></a>
      </nav>
      <QuickAccess />
    </div></header>
    <div id="main-content">{children}</div>
    <InstallApp />
    <WelcomeNotification />
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-content">
        <div className="footer-feature">
          <div className="footer-brand-block"><Brand /><span className="footer-kicker">FAITH · FELLOWSHIP · SERVICE</span></div>
          <p className="footer-mission">PEACE (SUMALISM) CONGREGATION is a church family growing in faith, fellowship and service through the Presbyterian Church of Ghana.</p>
          <a className="footer-contact-cta" href="/contact"><span className="footer-cta-icon"><Icon name="arrow-up-right" size={18} /></span><span><strong>Connect with us</strong><small>We would love to hear from you</small></span></a>
        </div>
        <div className="footer-column"><span className="footer-heading">Discover</span><a href="/about">About Peace Congregation</a><a href="/ministries">Church Groups & Ministries</a><a href="/events">Events & Programmes</a></div>
        <div className="footer-column"><span className="footer-heading">Faith resources</span><a href="/devotional">Daily Devotional</a><a href="/hymns">Hymns & Liturgy</a><a href="/sermons">Sermons & Messages</a><a href="/news">News & Announcements</a></div>
        <div className="footer-column"><span className="footer-heading">Helpful links</span><a href="/contact">Contact the Congregation</a><a href="/contact#prayer">Prayer requests</a><a href="https://pcgonline.org/" target="_blank" rel="noreferrer">Presbyterian Church of Ghana <Icon name="arrow-up-right" size={13} /></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Peace Congregation · Presbyterian Church of Ghana. All rights reserved.</span><span className="footer-bottom-right"><span className="footer-dot" /> Built for faith, community & connection <span className="footer-dot red" /></span></div>
      </div>
    </footer>
  </body></html>;
}
