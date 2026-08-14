"use client";

import Link from "next/link";
import {
  Heart,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Globe,
  BadgeCheck,
  Flag,
} from "lucide-react";

const VALUES = [
  {
    Icon: Heart,
    title: "Built with pagtutulungan",
    body: "FindBack PH is not a startup from San Francisco. It's built by Filipinos who&apos;ve lost phones in jeeps, wallets in MRT, and laptops inside Grab cars — and know exactly how frustrating it is when nothing and no one can help.",
    tone: "from-rose-500 to-pink-600",
  },
  {
    Icon: ShieldCheck,
    title: "Privacy, always. Never a quick sell.",
    body: "We will never sell your phone number, email, location data, or chat history. We will never show ads that follow you around the internet. This product has to pay for itself, but never at your expense.",
    tone: "from-indigo-500 to-violet-600",
  },
  {
    Icon: Globe,
    title: "For every Pilipino — everywhere",
    body: "Metro Manila is loud, but we think of Davao, Cebu, Iloilo, Zamboanga, Baguio, Tuguegarao first when we design. If it works in a 5th-class municipality on 3G data, it will work anywhere. That's our bar.",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    Icon: Flag,
    title: "Honesty over hype",
    body: "We won&apos;t tell you your item is 'guaranteed' to come back — because nothing in life is guaranteed. We'll promise you this: we give every report the best possible shot at a reunion. that&apos;s the only promise we can keep, so it&apos;s the only one we make.",
    tone: "from-amber-500 to-orange-600",
  },
];

const MILESTONES = [
  { year: "2024", label: "Idea", body: "Two U.P. students lose their phones on the same LRT-2 ride. A late-night conversation over milk tea becomes the first wireframe of FindBack PH." },
  { year: "2025", label: "Manila Beta", body: "Soft-launch at 4 universities: UP Diliman, ADMU, DLSU, UST. 1,200 users, 87 reported reunions in the first 90 days." },
  { year: "2025", label: "Cebu & Davao", body: "Expanded to Visayas and Mindanao with barangay-level location data. Partnered with SM Malls to list Info Desks as official Safe Zones." },
  { year: "Today", label: "Nationwide", body: "Present in 140+ cities and 81 provinces. 42,000+ active users. A small, bootstrapped team of 8 who reply to every support email personally." },
];

const PARTNERS = [
  "UP Diliman",
  "Ateneo de Manila",
  "DLSU Manila",
  "UST Sampaloc",
  "SM Malls PH",
  "Robinsons Malls",
  "Ayala Malls",
  "Grab Philippines",
];

export default function About() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora-bg pointer-events-none fixed inset-0 -z-10" />
      <div className="mesh-blob absolute -right-40 top-32 h-96 w-96 bg-indigo-400/25 blur-3xl" />
      <div className="mesh-blob absolute -left-40 top-[680px] h-[420px] w-[420px] bg-fuchsia-400/20 blur-3xl" />

      <section className="relative mx-auto w-full max-w-6xl px-5 pt-24 pb-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="pill pill-fuchsia inline-flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4" />
              Made in Manila · For every Pilipino
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              A community-driven platform for every
              <br />
              <span className="stat-num">waiting to get back what&apos;s theirs.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              FindBack PH is a community-powered lost-and-found for the Philippines. We believe a phone left in a
              UV Express, a wallet dropped at the mall, or a laptop forgotten in a classroom should not become a
              life-long loss. It should become a story — a story with a happy ending.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Hindi kami barya-barya app, hindi kami reseller, at hindi kami middleman. Kami ay tagapagtagpo
              lamang — the rest is up to the kindness of ordinary Filipinos who remember, if only for a minute,
              what it feels like to lose something important.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/report/lost" className="btn-primary btn-primary--violet inline-flex items-center gap-2">
                Do ng report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
                See how it works
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="glass-card relative overflow-hidden rounded-3xl p-7 sm:p-8">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-slate-900/10 ring-1 ring-white/20">
                <Sparkles className="h-8 w-8" strokeWidth={2.1} />
              </div>
              <blockquote className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-slate-900">
                {`"You'll never get back everything you lose — but at FindBack PH, you'll never be given zero chances either."`}
              </blockquote>
              <div className="mt-7 flex items-center gap-4 border-t border-slate-200/70 pt-5">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-bold text-white">
                  L
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Liza M. &amp; the FindBack team</div>
                  <div className="text-sm text-slate-500">Manila · 8 people, bootstrapped</div>
                </div>
              </div>
              <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { Icon: Users, value: "42K+", label: "Active volunteers & finders" },
            { Icon: MapPin, value: "81", label: "Provinces covered" },
            { Icon: BadgeCheck, value: "12,430", label: "Reunited items (and counting)" },
            { Icon: Heart, value: "0", label: "Hidden fees. Ever." },
          ].map((s, i) => (
            <div key={s.label} className="glass-card card-hover rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <s.Icon className="h-6 w-6 text-indigo-600" />
              <div className="mt-3 stat-num text-3xl font-bold tracking-tight">{s.value}</div>
              <div className="mt-1 text-sm text-slate-600 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill pill-indigo text-sm">Our guiding principles</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Four values we never trade.
          </h2>
          <p className="mt-3 text-slate-600">
            When a new feature has to choose between making money, looking flashy, or doing the right thing for the user — the right thing wins. Every single time.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="glass-card card-hover relative overflow-hidden rounded-3xl p-7 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${v.tone} text-white shadow-lg shadow-slate-900/5 ring-1 ring-white/20`}
              >
                <v.Icon className="h-7 w-7" strokeWidth={2.1} />
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{v.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{v.body}</p>
              <div className={`pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-gradient-to-br ${v.tone} opacity-[0.06] blur-2xl`} />
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill pill-emerald text-sm">Our story</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From LRT-2 lost phones to 81 provinces.
          </h2>
          <p className="mt-3 text-slate-600">
            Four years, three pivots, hundreds of late nights, and thousands of messages from users telling us their
            item came home — this is how FindBack PH got here.
          </p>
        </div>
        <ol className="relative mt-12 space-y-5">
          <div
            className="absolute left-8 top-3 bottom-3 w-px bg-gradient-to-b from-emerald-200/0 via-emerald-300/50 to-indigo-200/0 sm:left-12"
            aria-hidden="true"
          />
          {MILESTONES.map((m, i) => (
            <li key={`${m.year}-${m.label}`} className="relative animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="grid items-start gap-5 sm:grid-cols-[110px_1fr]">
                <div className="relative z-10 flex sm:justify-end">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 font-bold text-white shadow-lg ring-1 ring-white/20">
                    <div className="text-center leading-tight">
                      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Year</div>
                      <div className="text-lg">{m.year}</div>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-3xl p-7 card-hover">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">{m.label}</h3>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{m.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill pill-sky text-sm">Backed by them</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Backed by the institutions that keep Pinas moving.
          </h2>
          <p className="mt-3 text-slate-600">
            We&apos;re not alone. These universities, malls, and companies believe the Philippines deserves a
            real lost-and-found system — and {`they&apos;ve`} opened their campuses, desks, and hearts to make it happen.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PARTNERS.map((p) => (
            <div
              key={p}
              className="glass-card card-hover grid place-items-center rounded-2xl py-5"
            >
              <div className="px-4 text-center text-sm font-bold tracking-tight text-slate-700 sm:text-base">
                {p}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-28 sm:px-6">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-[1px] shadow-2xl shadow-indigo-900/20">
          <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 px-6 py-14 sm:px-14 sm:py-16">
            <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
            <div className="relative mx-auto max-w-3xl text-center text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                🇵🇭 Let&apos;s build this together
              </span>
              <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                One found item
                <br />
                ay isang masayang Pilipino.
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-indigo-100/95 sm:text-lg">
                Start a report in under 2 minutes. Share this page with one friend. Help us turn every {`"sayang naman"`}
                into a {`"I found it."`}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/report/lost"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-indigo-700 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
                >
                  Report a Lost Item
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/report/found"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.97]"
                >
                  Post a Found Item
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-6 text-sm text-indigo-100/80">
                🔒 100% free · No hidden charges · Open to every barangay
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
