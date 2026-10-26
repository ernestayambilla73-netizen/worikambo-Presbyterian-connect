import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Worikambo Presbyterian Connect",
  description: "The digital home for congregations, worship, news and resources in the Worikambo District of the Presbyterian Church of Ghana.",
  manifest: "/manifest.json",
};

function Brand() {
  return <a className="brand" href="/" aria-label="Worikambo Presbyterian Connect home">
    <span className="brand-mark" aria-hidden="true">✝</span>
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
        <a className="nav-cta" href="/contact">Plan a Visit</a>
      </nav>
    </div></header>
    {children}
    <footer className="site-footer"><div className="container">
      <div className="footer-grid">
        <div><Brand/><p style={{marginTop:16,maxWidth:270}}>Faith, fellowship and service across the Worikambo Presbyterian District.</p></div>
        <div><h3>Explore</h3><div className="footer-links"><a href="/about">About the District</a><a href="/congregations">Congregations</a><a href="/ministries">Church Groups</a><a href="/events">Events & Programmes</a></div></div>
        <div><h3>Resources</h3><div className="footer-links"><a href="/devotional">Daily Devotional</a><a href="/hymns">Hymns & Liturgy</a><a href="/sermons">Sermons</a><a href="/news">Church News</a></div></div>
        <div><h3>Get in touch</h3><div className="footer-links"><a href="/contact">Contact the District</a><a href="/contact#prayer">Prayer request</a><a href="/admin">Administration sign-in</a><a href="https://pcgonline.org/" target="_blank" rel="noreferrer">PCG official website ↗</a></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Worikambo Presbyterian Connect</span><span>That They All May Be One · John 17:21</span></div>
    </div></footer>
  </body></html>;
}