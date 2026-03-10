import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AU Property Data Hub", template: "%s | AU Property Data Hub" },
  description: "Australian suburb property data — house prices, rental yields, growth trends, and demographics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="emerald">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost text-xl">🏡 AU Property Hub</Link>
          </div>
          <div className="flex-none gap-2">
            <Link href="/compare" className="btn btn-sm btn-outline">Compare</Link>
            <Link href="/state/nsw" className="btn btn-sm btn-ghost">NSW</Link>
            <Link href="/state/vic" className="btn btn-sm btn-ghost">VIC</Link>
            <Link href="/state/qld" className="btn btn-sm btn-ghost">QLD</Link>
          </div>
        </div>
        <main className="flex-1">{children}</main>
        <footer className="footer footer-center p-6 bg-base-200 text-base-content">
          <div>
            <p>AU Property Data Hub © 2025. Data sourced from ABS Census and public records.</p>
            <p className="text-sm opacity-60">Prices are indicative estimates. Always verify with licensed agents.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
