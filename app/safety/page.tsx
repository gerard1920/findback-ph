"use client";

import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Users,
  EyeOff,
  Lock,
  PhoneOff,
  Banknote,
  AlertTriangle,
  BadgeCheck,
  Flag,
  HeartHandshake,
  ArrowRight,
  ChevronRight,
  Building,
} from "lucide-react";

const PILLARS = [
  {
    Icon: EyeOff,
    title: "Private-by-default listings",
    copy: "Serial numbers, hidden engravings, and unique marks you tick as 'private proof' never show up in the public feed. They are only revealed one-way — after the claimant passes your verification questions.",
    tone: "from-indigo-500 to-violet-600",
  },
  {
    Icon: Lock,
    title: "On-platform messaging only",
    copy: "We keep the whole conversation inside FindBack PH so there's always a timestamped, moderatable record. We never force you to hand over a phone number, Messenger, or Telegram to start the claim.",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    Icon: ShieldCheck,
    title: "Human-reviewed high-value claims",
    copy: "Any claim on a phone, laptop, wallet with cash, or piece of jewelry gets a manual review by our moderation team within 12 hours. We step in and slow things down when it matters.",
    tone: "from-sky-500 to-blue-600",
  },
  {
    Icon: Flag,
    title: "One-tap reporting and bans",
    copy: "Every chat, every listing has a Report button. Reports with evidence land in front of a human within 1 hour. Scammers and resellers get permanently banned — no second chances.",
    tone: "from-rose-500 to-pink-600",
  },
];

const SAFE_MEET = [
  {
    Icon: Building,
    title: "Mall information desks",
    copy: "SM, Ayala, Robinsons — every major mall has a manned, CCTV-covered info desk you can use as a free Safe Zone. Just say you're there for a FindBack PH meetup.",
  },
  {
    Icon: MapPin,
    title: "Barangay halls & police stations",
    copy: "The gold standard for high-value returns. Logbook, witness, official receipt if you want one. Most barangays are happy to accommodate a 10-minute item return.",
  },
  {
    Icon: Users,
    title: "Coffee shops during daytime",
    copy: "Pick a well-lit, busy branch (Starbucks, J.CO, Bo's). Sit where the staff can see both of you. Never meet at 10PM inside a parking lot — kahit sabihin niyang 'mabilisan lang.'",
  },
];

const NEVER_DO = [
  {
    Icon: Banknote,
    title: "Never send money first",
    copy: "No one legitimate asks for Gcash, Palawan, or Maya before you've seen and verified the item. 'Pampa-load lang,' 'pamasahe,' 'downpayment' — block and report instantly.",
  },
  {
    Icon: PhoneOff,
    title: "Never leave the app too early",
    copy: "If someone says 'let's just talk on Viber' in the very first message — that's a red flag. Keep the conversation on-platform until the meetup is confirmed.",
  },
  {
    Icon: ShieldAlert,
    title: "Never share OTPs or PINs",
    copy: "Real owners don't need your OTP, your bank PIN, your email recovery code, or a screenshot of your ID. They just need to describe the item. Period.",
  },
  {
    Icon: AlertTriangle,
    title: "Never trust a score alone",
    copy: "Match scores are a helpful hint, not proof. A 97% match is still a suggestion. Always, always ask the private questions you wrote when you filed the report.",
  },
];

export default function Safety() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora-bg pointer-events-none fixed inset-0 -z-10" />
      <div className="mesh-blob absolute -left-40 top-28 h-96 w-96 bg-emerald-400/25 blur-3xl" />
      <div className="mesh-blob absolute -right-40 top-[620px] h-[420px] w-[420px] bg-rose-400/20 blur-3xl" />

      <section className="relative mx-auto w-full max-w-6xl px-5 pt-24 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill pill-emerald inline-flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Kaligtasan muna. Bago ang lahat.
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Your safety is the
            <br />
            <span className="stat-num">feature we ship first.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
            FindBack PH connects people — but it {`doesn't`} replace your judgment.
            Read this page once, keep it in mind every time you do a meetup.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50/70 to-yellow-50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                <AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-950">
                  This platform is a connector — hindi po ito sanglaan o tindahan.
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-amber-900/90">
                  We do not verify every {`claimant's`} identity, we do not hold items in escrow, and we never
                  facilitate payments of any kind. If a return goes bad, you can report it to us and to the police —
                  but caution on your part is always the first and most important line of defense.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill pill-indigo text-sm">Built-in guardrails</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Safety features we built into the product.
          </h2>
          <p className="mt-3 text-slate-600">
            Hindi ka namin hinahayaang mag-isa. Every time you open FindBack PH, these four things are working for you.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="glass-card card-hover relative overflow-hidden rounded-3xl p-7 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.tone} text-white shadow-lg shadow-slate-900/5 ring-1 ring-white/20`}
              >
                <p.Icon className="h-7 w-7" strokeWidth={2.1} />
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{p.copy}</p>
              <div
                className={`pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br ${p.tone} opacity-[0.07] blur-2xl`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill pill-violet text-sm">Where to meet</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Safe Zones — we recommend these first.
          </h2>
          <p className="mt-3 text-slate-600">
            The exact spot matters more than you think. Choose any of these three and {`you're`} 90% of the way there.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {SAFE_MEET.map((m, i) => (
            <div
              key={m.title}
              className="glass-card card-hover relative rounded-3xl p-6 animate-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                <m.Icon className="h-6 w-6" strokeWidth={2.1} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.copy}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <BadgeCheck className="h-4 w-4" />
                Recommended Safe Zone
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill pill-rose text-sm">The 4 hard {`no's`}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Huwag, huwag, huwag — four things we beg you not to do.
          </h2>
          <p className="mt-3 text-slate-600">
            9 out of 10 failed or dangerous returns happen because one of these rules was broken.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {NEVER_DO.map((n, i) => (
            <div
              key={n.title}
              className="relative rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/40 p-7 card-hover ring-1 ring-rose-100/60"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
                <n.Icon className="h-7 w-7" strokeWidth={2.1} />
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{n.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{n.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-4xl px-5 pb-28 sm:px-6">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 p-[1px] shadow-2xl shadow-emerald-900/10">
          <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 px-6 py-14 sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" />
            <div className="relative grid items-center gap-8 sm:grid-cols-[1.2fr_1fr]">
              <div className="text-white">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                  <HeartHandshake className="h-4 w-4" />
                  Kapit-bisig tayo
                </span>
                <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  May nakita kang kahina-hinala?
                  <br />
                  One tap — we take it from there.
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-emerald-50/95 sm:text-base">
                  The Report abuse button is inside every chat bubble and every listing. Attach a screenshot if you
                  have one. Humans, not bots, read every report that comes in.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/report-abuse"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-emerald-700 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
                >
                  <Flag className="h-4 w-4" />
                  Report abuse or scam
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/report/lost"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.97]"
                >
                  Gumawa ng report
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
