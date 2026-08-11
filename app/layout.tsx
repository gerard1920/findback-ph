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
  openGraph: {
    title: "FindBack PH — Get back what you lost.",
    description:
      "Lost a phone, wallet, or IDs? Report in 2 minutes. The community + AI matcher gets your stuff back. Safely.",
    type: "website",
    locale: "en_PH",
    siteName: "FindBack PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "FindBack PH — Lost & Found Philippines",
    description: "Report lost and found items. AI matching. Private verification. Safe returns.",
  },
  icons: { icon: "/favicon.svg" },
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
    <html lang="en" className={inter.variable}>
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
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-lg shadow-indigo-200">
                  FB
                </span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  FindBack <span className="text-indigo-700">PH</span>
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
