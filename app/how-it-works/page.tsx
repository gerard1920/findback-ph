"use client";

// auto-commit test: safe small change
// watcher trigger test

import Link from "next/link";
import {
  FileUp,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Clock,
  BadgeCheck,
  MapPin,
  Users,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  {
    Icon: FileUp,
    step: "01",
    title: "Report in under 2 minutes",
    subtitle: "Lost or found — same fast form.",
    copy: "Snap a photo, choose a category, and tell us where it happened. Province, city, barangay, landmark — the more specific, the faster the match. Private details like serial numbers stay encrypted; we never show them publicly.",
    bullets: [
      "Upload up to 5 photos (5MB each) for visual matching",
      "Pinpoint the exact barangay or landmark (e.g., 'MOA Food Court, Pasay')",
      "Hide brand new / unique marks from public view",
    ],
    tone: "from-indigo-500 to-violet-600 text-white",
  },
  {
    Icon: Sparkles,
    step: "02",
    title: "AI scans — instantly",
    subtitle: "A possible match before you close the page.",
    copy: "Our matcher runs the moment your report goes live. It cross-references category, photos, description keywords, and location against every other report in your area. If the score is high enough, both sides get a notification in real time.",
    bullets: [
      "Match scores from 0% to 99% based on 6 data points",
      "Nearby-first: items within your barangay bubble to the top",
      "Email + in-app alert so you never miss a candidate",
    ],
    tone: "from-fuchsia-500 to-pink-600 text-white",
  },
  {
    Icon: MessageSquare,
    step: "03",
    title: "Chat on-platform — safely",
    subtitle: "No phone numbers, no personal emails yet.",
    copy: "Every conversation stays inside FindBack PH. You get a full paper trail, and neither side sees the other's real contact info until both are ready. Built-in quick replies for the common questions.",
    bullets: [
      "Timestamps for every message — transparent history",
      "One-tap Report abuse button if anything feels off",
      "No need to hand over your Viber or Telegram",
    ],
    tone: "from-sky-500 to-blue-600 text-white",
  },
  {
    Icon: ShieldCheck,
    step: "04",
    title: "Verify ownership privately",
    subtitle: "Only the real owner knows.",
    copy: "We ask claimants to prove they know what only the real owner would — the scratch on the bottom, the sticker inside, the exact serial number, the secret engraving. Until that checks out, contact details and pickup details stay locked.",
    bullets: [
      "Private verification fields only visible during claim",
      "Human moderators flag suspicious claims within 12 hours",
      "Never take a match score as proof — always verify",
    ],
    tone: "from-emerald-500 to-teal-600 text-white",
  },
  {
    Icon: HeartHandshake,
    step: "05",
    title: "Reunite — the good ending",
    subtitle: "Meet safely, mark it done.",
    copy: "Choose a police station, mall info desk, or barangay hall — well-lit, public, covered by CCTV. Bring a friend if you can. When the item is back with its owner, both sides tap 'Mark as Resolved' and the story closes. 🇵🇭",
    bullets: [
      "Curated list of Safe Zones per city (police HQ, mall desks)",
      "Optional Thank-you tips — no mandatory fees ever",
      "Return stats go on your public profile if you opt in",
    ],
    tone: "from-amber-500 to-orange-600 text-white",
  },
];

const FAQ = [
  {
    q: "Is FindBack PH free to use?",
    a: "Yes — 100%. Anyone can report, browse, and message for free. We never take a cut of any tip, and we never charge to unlock a match. The platform is funded by small donations and partner establishments who sponsor their city's Safe Zones.",
  },
  {
    q: "What if my item is expensive?",
    a: "For high-value items (laptops, phones, jewelry), we automatically route matches through an extra human-review step and suggest meeting at the nearest police station. You can also mark a report as 'high-priority' to boost it in the moderation queue.",
  },
  {
    q: "Who can see my photos?",
    a: "Public photos are visible to everyone (that's how matches happen!). Any photo you mark 'private proof' is only shown to the person making a claim — after they answer your verification questions correctly.",
  },
  {
    q: "What happens to old reports?",
    a: "After 60 days without a match, reports automatically expire and move out of the public feed. You can always re-open or refresh them with one tap — it takes 10 seconds.",
  },
];

export default function HowItWorks() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora-bg pointer-events-none fixed inset-0 -z-10" />
      <div className="mesh-blob absolute -left-40 top-24 h-96 w-96 bg-indigo-400/30 blur-3xl" />
      <div className="mesh-blob absolute -right-40 top-[500px] h-[420px] w-[420px] bg-fuchsia-400/25 blur-3xl" />

      <section className="relative mx-auto w-full max-w-6xl px-5 pt-24 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill pill-indigo inline-flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            Simple 5-step process
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            From <span className="stat-num">{`"where is it?"`}</span> to <span className="stat-num">{`"it's back."`}</span>
            <br className="hidden sm:block" />
            <span className="text-slate-900">in five clean steps.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
            No stress, no drama. Built for everyday Filipinos — UV Express commuters,
            mall-goers, students, and travelers across 81 provinces.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/report/lost" className="btn-primary btn-primary--violet inline-flex items-center gap-2">
              Report a Lost Item
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/report/found" className="btn-primary btn-primary--emerald inline-flex items-center gap-2">
              Post a Found Item
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <ol className="relative space-y-10">
          <div
            className="absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-indigo-200/0 via-indigo-300/60 to-fuchsia-200/0 sm:left-12"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => (
            <li key={s.step} className="relative animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="grid items-start gap-6 sm:grid-cols-[110px_1fr]">
                <div className="relative z-10 flex sm:justify-end">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.tone} shadow-lg shadow-slate-900/5 ring-1 ring-white/20`}
                  >
                    <s.Icon className="h-7 w-7" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="glass-card card-hover relative rounded-3xl p-7 sm:p-8">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="stat-num font-mono text-sm font-bold tracking-wider">{s.step}</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{s.title}</h2>
                  </div>
                  <p className="mt-1 text-base font-medium text-indigo-700 sm:text-lg">{s.subtitle}</p>
                  <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">{s.copy}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr]">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-[15px] text-slate-700">
                        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { Icon: Clock, label: "Average report time", value: "< 2 min" },
            { Icon: MapPin, label: "Cities covered", value: "140+" },
            { Icon: Users, label: "Active finders", value: "42,000+" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-2xl p-5 card-hover"
            >
              <s.Icon className="h-6 w-6 text-indigo-600" />
              <div className="mt-3 stat-num text-3xl font-bold tracking-tight">{s.value}</div>
              <div className="mt-1 text-sm text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-4xl px-5 pb-28 sm:px-6">
        <div className="text-center">
          <span className="pill pill-violet text-sm">FAQ</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Questions, answered simply.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            If you&apos;re feeling anxious — that&apos;s normal {`'yan. Here's`} the straight answer on the things most users ask first.
          </p>
        </div>
        <div className="mt-10 space-y-4">
          {FAQ.map((f, i) => (
            <details
              key={f.q}
              className="glass-card group rounded-2xl p-5 open:pb-6"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <h3 className="text-[17px] font-semibold text-slate-900">{f.q}</h3>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
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
                ✨ Ready to get started?
              </span>
              <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                Lost something? Found something?
                <br />
                Huwag nang maghintay.
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-indigo-100/95 sm:text-lg">
                One post, one match, one reunion. Instead of posting in 5 Facebook groups and dealing with comment spam — use FindBack PH.
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
                🔒 100% free · Walang hidden fees · Walang mandatory tip
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
