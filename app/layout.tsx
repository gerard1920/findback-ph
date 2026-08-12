import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { currentUser } from "@/lib/auth";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://findback.ph"),
  title: {
    default: "FindBack PH — Get back what you lost. Filipinos helping Filipinos.",
    template: "%s — FindBack PH",
  },
  description:
    "The Philippines' most trusted community lost and found. Report lost or found items in under 2 minutes. AI-powered matching, private ownership verification, and secure handovers across 81 provinces.",
  keywords: [
    "lost and found Philippines",
    "nawawalang gamit",
    "find lost phone Manila",
    "report lost wallet PH",
    "balik gamit",
    "community lost and found",
    "FindBack PH",
    "lost items PH",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.svg" }],
  },
  openGraph: {
    title: "FindBack PH — Get back what you lost.",
    description:
      "Lost a phone, wallet, or IDs? Report in 2 minutes. The community + AI matcher gets your stuff back. Safely.",
    type: "website",
    locale: "en_PH",
    siteName: "FindBack PH",
    images: [
      {
        url: "/brand/logo-hero.jpg",
        width: 1600,
        height: 900,
        alt: "FindBack PH — Lost and Found Philippines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FindBack PH — Lost & Found Philippines",
    description: "Report lost and found items. AI matching. Private verification. Safe returns.",
    images: ["/brand/logo-hero.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await currentUser();
  } catch {
    user = null;
  }

  const navbarUser = user
    ? {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: String(user.role),
        status: String(user.status),
      }
    : null;

  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased [font-feature-settings:'cv11','ss01'] selection:bg-indigo-100 selection:text-indigo-900">
        <Providers>
          <Navbar user={navbarUser} />
          <main className="flex-1">{children}</main>
        </Providers>
        <footer className="relative mt-32 overflow-hidden border-t border-slate-200/80 bg-slate-50/60 backdrop-blur">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-64 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
          />
          <div className="container-page flex flex-col items-start justify-between gap-10 py-16 text-sm md:flex-row md:items-center">
            <div className="max-w-md">
              <div className="flex items-center gap-2.5">
                <svg
                  viewBox="0 0 40 40"
                  className="h-9 w-9 drop-shadow-[0_4px_10px_rgba(30,58,138,0.18)]"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="ft-ic-bg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0b2a6b" />
                      <stop offset="55%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="ft-ic-ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill="url(#ft-ic-bg)" />
                  <circle cx="17" cy="17" r="8.2" fill="none" stroke="url(#ft-ic-ring)" strokeWidth="2.4" />
                  <circle cx="17" cy="17" r="4.6" fill="#fbbf24" />
                  <g fill="#facc15">
                    <circle cx="17" cy="9.5" r="1.1" />
                    <circle cx="17" cy="24.5" r="1.1" />
                    <circle cx="9.5" cy="17" r="1.1" />
                    <circle cx="24.5" cy="17" r="1.1" />
                    <circle cx="11.8" cy="11.8" r="0.85" />
                    <circle cx="22.2" cy="11.8" r="0.85" />
                    <circle cx="11.8" cy="22.2" r="0.85" />
                    <circle cx="22.2" cy="22.2" r="0.85" />
                  </g>
                  <path d="M22.4 22.4 L31 32.2" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="31" cy="32.2" r="2" fill="#dc2626" />
                </svg>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  FindBack{" "}
                  <span className="relative font-black">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#7c3aed]">
                      PH
                    </span>
                    <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#fbbf24] via-[#dc2626] to-[#1e40af]" />
                  </span>
                </span>
              </div>
              <p className="mt-4 leading-relaxed text-slate-600">
                Ang nawala&apos;y babalik. The Filipino community platform for reporting lost and found items safely.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-slate-600 md:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Platform</p>
                <ul className="space-y-2">
                  <li><Link href="/lost" className="hover:text-indigo-700">Browse lost</Link></li>
                  <li><Link href="/found" className="hover:text-indigo-700">Browse found</Link></li>
                  <li><Link href="/report" className="hover:text-indigo-700">Report an item</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Company</p>
                <ul className="space-y-2">
                  <li><Link href="/about" className="hover:text-indigo-700">About</Link></li>
                  <li><Link href="/how-it-works" className="hover:text-indigo-700">How it works</Link></li>
                  <li><Link href="/safety" className="hover:text-indigo-700">Safety</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Get Help</p>
                <ul className="space-y-2">
                  <li><Link href="/report-abuse" className="hover:text-indigo-700">Report abuse</Link></li>
                  <li><Link href="/safety#handover" className="hover:text-indigo-700">Safe handover guide</Link></li>
                  <li><Link href="/login" className="hover:text-indigo-700">Contact support</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container-page flex flex-col items-start justify-between gap-2 border-t border-slate-200/70 py-6 text-xs text-slate-500 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} FindBack PH. Ginawa nang may pagmamahal para sa lahat ng Pilipino. 🇵🇭</p>
            <p>Privacy-first · No payments on-platform · Verify ownership always</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
