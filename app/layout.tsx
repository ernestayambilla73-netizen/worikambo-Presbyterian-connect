import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Worikambo Presbyterian Connect",
  description: "Connect with the Presbyterian Church of Ghana, Worikambo District.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}