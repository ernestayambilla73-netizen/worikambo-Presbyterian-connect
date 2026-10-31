import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "PEACE (SUMALISM) CONGREGATION | Presbyterian Church of Ghana",
 description: "The digital home of PEACE (SUMALISM) CONGREGATION of the Presbyterian Church of Ghana.",
 manifest: "/manifest.json",
 applicationName: "PEACE (SUMALISM) CONGREGATION",
 appleWebApp: { capable: true, statusBarStyle: "default", title: "PEACE (SUMALISM) CONGREGATION" },
 icons: { icon: [{ url: "/api/pcg-crest", type: "image/png" }], shortcut: ["/api/pcg-crest"], apple: [{ url: "/api/pcg-crest", type: "image/png" }] },
};
export const viewport: Viewport = { themeColor: "#102b54", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body>{children}</body></html>;
}
