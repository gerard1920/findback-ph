import Link from "next/link";
import { Search, HandHeart, ShieldCheck, Zap, MapPin, MessageCircle } from "lucide-react";

export default function ReportHomePage() {
  return (
    <main className="container-page max-w-6xl py-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Start a new report
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Did you lose something, or find something?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
          Reporting takes about 2 minutes. The more detail you add, the faster the FindBack PH
          community can match lost items with their rightful owners.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* LOST CARD */}
        <Link
          href="/report/lost"
          className="group relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-rose-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md">
              <Search size={28} strokeWidth={2.2} />
            </div>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
              🔴 LOST
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">I lost something</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Describe the item, when and where you last had it, upload photos, and offer a reward if you
            can. The community and our AI matcher will look through every found item for a match.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="text-rose-600">✓</span> Instant possible-match suggestions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-600">✓</span> Private ownership verification
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-600">✓</span> Optional reward incentive
            </li>
          </ul>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition group-hover:bg-rose-700">
            Report a lost item →
          </div>
        </Link>

        {/* FOUND CARD */}
        <Link
          href="/report/found"
          className="group relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md">
              <HandHeart size={28} strokeWidth={2.2} />
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
              🔵 FOUND
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">I found something</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Good samaritan mode! Describe what you found and where. Distinguishing details are kept
            private and only shown to claimants who can first describe them correctly.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="text-sky-600">✓</span> Private serial / marks not exposed publicly
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sky-600">✓</span> Secure in-app claim &amp; messaging system
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sky-600">✓</span> Automated lost-item matching within seconds
            </li>
          </ul>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition group-hover:bg-sky-700">
            Report a found item →
          </div>
        </Link>
      </div>

      {/* What happens next */}
      <section className="mt-16">
        <h3 className="text-center text-lg font-bold text-slate-900 sm:text-xl">What happens next?</h3>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Step
            num="01"
            icon={Zap}
            title="You post your report"
            body="Our form captures all the important details: title, category, description, date/time, location, and photos."
          />
          <Step
            num="02"
            icon={MapPin}
            title="We scan for matches"
            body="Our matcher compares every new post against the opposite category (lost vs found) in your area."
          />
          <Step
            num="03"
            icon={MessageCircle}
            title="You connect safely"
            body="Claimants and finders go through a private verification flow before personal contact info is ever shared."
          />
        </div>
      </section>

      <div className="mt-12 flex items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 text-emerald-900 ring-1 ring-emerald-100">
        <ShieldCheck size={22} className="shrink-0 text-emerald-700" />
        <p className="text-sm">
          <span className="font-bold">Privacy first.</span> Phone numbers and emails are never shown publicly.
          All claims go through our built-in verification flow so only the real owner gets the item back.
          <Link href="/safety" className="ml-2 font-semibold underline underline-offset-2 hover:text-emerald-800">
            Read safety tips →
          </Link>
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        See something suspicious?{" "}
        <Link href="/report-abuse" className="font-medium text-slate-700 underline hover:text-slate-900">
          Report abuse / scams
        </Link>
        .
      </p>
    </main>
  );
}

function Step({
  num,
  icon: Icon,
  title,
  body,
}: {
  num: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black tracking-tighter text-blue-700 ring-1 ring-blue-100">
          {num}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Icon size={18} />
        </div>
      </div>
      <h4 className="mt-4 text-base font-bold text-slate-900">{title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
