"use client";

import Link from "next/link";
import {
  Search,
  Smartphone,
  Wallet,
  KeyRound,
  Backpack,
  FileText,
  Gem,
  CarFront,
  BookOpen,
  Package,
  Sparkles,
  ShieldCheck,
  MapPin,
  Bot,
  MessageCircle,
  Lock,
  BadgeCheck,
  ChevronRight,
  ArrowRight,
  Gift,
  GraduationCap,
  ShoppingBag,
  Plane,
  Briefcase,
  Star,
  CheckCircle2,
  Play,
} from "lucide-react";
import { ItemCard, parseCardItem, type CardItemInput } from "@/components/item-card";
import { AutoRefreshItems } from "@/components/auto-refresh-items";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const CATS: { name: string; Icon: typeof Smartphone; hue: string }[] = [
  { name: "Electronics",   Icon: Smartphone, hue: "from-indigo-500/15 to-indigo-500/5 text-indigo-700 border-indigo-200/70" },
  { name: "Wallets",       Icon: Wallet,     hue: "from-emerald-500/15 to-emerald-500/5 text-emerald-700 border-emerald-200/70" },
  { name: "IDs & Documents", Icon: FileText, hue: "from-sky-500/15 to-sky-500/5 text-sky-700 border-sky-200/70" },
  { name: "Bags",          Icon: Backpack,   hue: "from-amber-500/15 to-amber-500/5 text-amber-700 border-amber-200/70" },
  { name: "Keys",          Icon: KeyRound,   hue: "from-rose-500/15 to-rose-500/5 text-rose-700 border-rose-200/70" },
  { name: "Jewelry",       Icon: Gem,        hue: "from-fuchsia-500/15 to-fuchsia-500/5 text-fuchsia-700 border-fuchsia-200/70" },
  { name: "Vehicle Items", Icon: CarFront,   hue: "from-violet-500/15 to-violet-500/5 text-violet-700 border-violet-200/70" },
  { name: "School Items",  Icon: BookOpen,   hue: "from-blue-500/15 to-blue-500/5 text-blue-700 border-blue-200/70" },
  { name: "Other",         Icon: Package,    hue: "from-slate-500/15 to-slate-500/5 text-slate-700 border-slate-200/70" },
];

const FEATURES: {
  Icon: typeof Bot;
  title: string;
  body: string;
  tone: string;
}[] = [
  {
    Icon: Bot,
    title: "AI-powered instant matching",
    body: "Our matcher scans every new found item against your lost report within seconds — by category, photos, description, and location. You&apos;re notified the instant a possible match goes live.",
    tone: "from-indigo-500 to-violet-600 text-white",
  },
  {
    Icon: Lock,
    title: "Private ownership verification",
    body: "Serial numbers, scratches, and private marks are never shown publicly. Claimants must describe unique details only the real owner would know — before any contact info is exchanged.",
    tone: "from-emerald-500 to-teal-600 text-white",
  },
  {
    Icon: MapPin,
    title: "Map-pinned barangay-level accuracy",
    body: "Report by province, city, barangay, and landmark. Filter results by distance from your location so you only see what matters in Metro Manila, Cebu, Davao — or any barangay in between.",
    tone: "from-sky-500 to-blue-600 text-white",
  },
  {
    Icon: MessageCircle,
    title: "Secure in-app messaging",
    body: "Chats are kept on-platform so there&apos;s always a paper trail. No one sees your real phone number or email until you decide to hand the item over. Safer for everyone.",
    tone: "from-rose-500 to-pink-600 text-white",
  },
  {
    Icon: ShieldCheck,
    title: "Trust & safety, built-in",
    body: "Community reports, scam flags, verified profiles, and a 10-point safe-handover checklist help you meet up in public spots with confidence — every single time.",
    tone: "from-amber-500 to-orange-600 text-white",
  },
  {
    Icon: Gift,
    title: "Flexible reward incentives",
    body: "Offer a cash reward, a happy meal, a bayad-pasok fare — whatever feels right for the person who returns what&apos;s yours. We never take a cut.",
    tone: "from-fuchsia-500 to-purple-600 text-white",
  },
];

const TESTIMONIALS: {
  quote: string;
  name: string;
  role: string;
  location: string;
  initial: string;
  tone: string;
}[] = [
  {
    quote:
      "I left my laptop in a UV Express from Cubao to Fairview. I posted it here at 10pm, had 3 match suggestions by midnight, and got it back the next morning after verifying serial number + sticker. Salamat talaga, FindBack!",
    name: "Angela Reyes",
    role: "Freelance graphic designer",
    location: "Quezon City",
    initial: "A",
    tone: "from-rose-500 to-pink-600",
  },
  {
    quote:
      "Found a student&apos;s school bag with a full set of textbooks at SM Seaside. I posted it, used the verification questions (they had to name two subjects + the doodle on the pencil case), and handed it over at the info desk two hours later.",
    name: "Mark Villanueva",
    role: "Restaurant floor manager",
    location: "Cebu City",
    initial: "M",
    tone: "from-sky-500 to-blue-600",
  },
  {
    quote:
      "Lumipad yung phone ko sa habulan ng jeep sa Monumento. Akala ko gone na forever — I got a notification 3 days later: a kind tsuper from Marikina turned it in. We met at the LTO office, verified the IMEI, and my sim + memories are back. 🥹",
    name: "Joanna Santos",
    role: "College senior, PUP",
    location: "Caloocan City",
    initial: "J",
    tone: "from-violet-500 to-fuchsia-600",
  },
];

const USE_CASES: {
  Icon: typeof GraduationCap;
  title: string;
  body: string;
}[] = [
  { Icon: GraduationCap, title: "Students &amp; campuses", body: "Lost IDs, textbooks, lab gowns, laptops inside the library — post your campus and every student org sees it." },
  { Icon: ShoppingBag,     title: "Malls &amp; restos",      body: "From MOA food court trays to forgotten coffee-shop planners, 62% of found wallets get claimed in under 4 hours." },
  { Icon: Briefcase,       title: "Offices &amp; commuters", body: "BGC, Makati, Ortigas UV Express, MRT3, P2P buses — finders and losers find each other by route, not just city." },
  { Icon: Plane,           title: "Travelers &amp; airports", body: "NAIA Terminal 3, Clark, Cebu Pac seats, Grab drop-offs: tag your flight number or plate for faster matches." },
];

export default function Home() {
  const [items, setItems] = useState<CardItemInput[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [heroQuery, setHeroQuery] = useState("");
  const [heroCity, setHeroCity] = useState("");

  useEffect(() => {
    // Smooth scroll for in-page anchors
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const a = target?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const res = await fetch("/api/items.php?limit=6", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setItems(data.data?.items || []);
        }
      } catch {
        /* ignore network errors during SSR */
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const refresh = async () => {
    const res = await fetch("/api/items.php?limit=6", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.data?.items || []);
      setNewItemsCount(0);
      setShowNotification(false);
    }
  };

  function onHeroSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = heroQuery.trim();
    const city = heroCity.trim();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (city) sp.set("city", city);
    const target = `/lost${sp.toString() ? "?" + sp.toString() : ""}`;
    toast({
      variant: "info",
      title: "Searching matches…",
      description: q || city ? `Looking for ${q ? `"${q}" ` : ""}${city ? `near ${city}` : ""}` : "Showing all lost items.",
      durationMs: 1500,
    });
    window.setTimeout(() => router.push(target), 220);
  }

  return (
    <main className="relative overflow-hidden">
      <AutoRefreshItems
        onNewItems={(n) => {
          setNewItemsCount(n);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 6000);
        }}
        interval={15000}
      />

      {/* =========================================================
          SECTION 1: HERO
          ========================================================= */}
      <section className="relative aurora-bg">
        {/* decorative blobs */}
        <div className="mesh-blob -left-24 top-24 h-80 w-80 bg-indigo-400/50" />
        <div className="mesh-blob right-0 top-52 h-96 w-96 bg-fuchsia-400/40 animate-float" />
        <div className="mesh-blob bottom-0 left-1/3 h-72 w-72 bg-emerald-300/30 animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 grid-lines" />

        <div className="relative container-page pt-20 pb-28 sm:pt-24 lg:pt-28 lg:pb-36">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            {/* Copy */}
            <div className="lg:col-span-7">
              <span className="eyebrow animate-fade-up">
                <Sparkles size={14} /> Ang nawala&apos;y babalik.
              </span>
              <h1
                className="mt-5 section-title text-pretty leading-[1.05] sm:text-5xl lg:text-6xl xl:text-[68px] animate-fade-up"
                style={{ animationDelay: "0.05s" }}
              >
                Get back <span className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">what you lost</span>.
                <br className="hidden sm:block" />
                Filipinos helping Filipinos.
              </h1>
              <p
                className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-slate-600 sm:text-xl animate-fade-up"
                style={{ animationDelay: "0.1s" }}
              >
                Post a lost or found item in under 2 minutes. AI-powered matching, private ownership verification,
                and a nationwide community of 42,000+ kind finders reuniting wallets, phones, IDs and memories — safely — across all 81 provinces.
              </p>

              <div
                className="mt-9 flex flex-col gap-3 sm:flex-row animate-fade-up"
                style={{ animationDelay: "0.15s" }}
              >
                <Link href="/report/lost" className="btn-primary btn-rose shine relative px-7 py-4 text-base">
                  🔴 Report something lost
                  <ChevronRight size={18} />
                </Link>
                <Link href="/report/found" className="btn-primary--emerald shine relative px-7 py-4 text-base">
                  💙 Post a found item
                  <ChevronRight size={18} />
                </Link>
              </div>

              <div
                className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> No credit card required</span>
                <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> Posts go live instantly</span>
                <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> Delete your posts any time</span>
              </div>

              {/* Search bar */}
              <form
                onSubmit={onHeroSearch}
                noValidate
                className="glass-card mt-10 grid gap-3 p-3 sm:grid-cols-[2fr_1.2fr_auto] animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-1 ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200 hover:-translate-y-0.5">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    name="q"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    aria-label="What are you searching for?"
                    className="m-0 h-auto border-0 bg-transparent p-3 shadow-none focus:ring-0 focus:-translate-y-0"
                    placeholder="iPhone, black wallet, UMID, student ID…"
                  />
                </div>
                <input
                  name="city"
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  placeholder="Quezon City · Cebu · Davao…"
                  className="m-0 bg-white/90 transition-all duration-200 hover:-translate-y-0.5"
                />
                <button
                  type="submit"
                  className="btn-primary justify-center py-3 text-base active:scale-[0.98]"
                >
                  Search →
                </button>
              </form>
            </div>

            {/* Hero visual: device mockup showing a found item */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto w-[300px] sm:w-[340px] lg:w-[360px] xl:w-[380px]">
                <div className="device-mock animate-float">
                  <div className="device-mock__screen">
                    {/* Status bar */}
                    <div className="relative z-10 flex items-center justify-between px-7 pb-3 pt-16 text-[11px] font-bold text-slate-500">
                      <span>9:41</span>
                      <span>📶  🔋</span>
                    </div>

                    {/* Found card */}
                    <div className="mx-5 space-y-3 pb-6">
                      <span className="pill-emerald">🔵 Possible match · 94% score</span>
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-indigo-50/60 ring-1 ring-indigo-100 shadow-lg shadow-indigo-100/60">
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-100">
                          <img
                            src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=lost%20black%20apple%20iphone%2015%20pro%20case%20with%20red%20bumper%20on%20white%20cafe%20table%20overhead%20photo&image_size=landscape_4_3"
                            alt="Found item preview"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute left-3 top-3 pill-emerald">FOUND</span>
                          <span className="absolute right-3 top-3 pill-slate">2h ago</span>
                        </div>
                        <div className="space-y-2 p-4">
                          <p className="text-xs font-semibold text-indigo-700">Electronics · Near MOA, Pasay</p>
                          <h4 className="text-lg font-extrabold tracking-tight text-slate-900">
                            Black iPhone 15 Pro, red Spigen case
                          </h4>
                          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                            Found near Starbucks North Wing at 4pm. Minor scratch on bottom right. Finder: &quot;Willing to meet at info desk only.&quot;
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex -space-x-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white ring-2 ring-white">J</span>
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white ring-2 ring-white">M</span>
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-500 text-[11px] font-bold text-white ring-2 ring-white">A</span>
                            </div>
                            <span className="text-xs font-bold text-indigo-700">View claim flow →</span>
                          </div>
                        </div>
                      </div>

                      {/* mini steps */}
                      <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-slate-200/70 shadow-md">
                        <div className="space-y-3">
                          {[
                            { n: 1, label: "Describe unique marks", done: true },
                            { n: 2, label: "Finder verifies",        done: true },
                            { n: 3, label: "Meet in public place",   done: false },
                          ].map((s) => (
                            <div key={s.n} className="flex items-center gap-3">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${s.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {s.done ? <CheckCircle2 size={14} /> : s.n}
                              </span>
                              <p className={`text-sm font-medium ${s.done ? "text-slate-900" : "text-slate-500"}`}>{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* gradient glow bottom of screen */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-indigo-100/70 via-indigo-50/40 to-transparent"
                    />
                  </div>
                </div>

                {/* Floating cards around device */}
                <div
                  className="animate-float absolute -left-10 top-28 hidden rounded-2xl bg-white/90 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur md:block"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><MapPin size={18} /></div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">3 nearby</p>
                      <p className="text-sm font-bold text-slate-900">Pasay matches</p>
                    </div>
                  </div>
                </div>

                <div
                  className="animate-float absolute -right-6 top-10 hidden rounded-2xl bg-white/90 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur md:block"
                  style={{ animationDelay: "0.8s" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><Star size={18} /></div>
                    <div>
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500">4.9 · 12,430 returns</p>
                    </div>
                  </div>
                </div>

                <div
                  className="animate-float absolute -bottom-4 -right-4 hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white shadow-2xl md:block"
                  style={{ animationDelay: "1.2s" }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Recovered today</p>
                  <p className="mt-1 text-3xl font-black tracking-tight">387</p>
                  <p className="mt-1 text-xs opacity-90">📈 +18% vs last week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST BAR (immediately below hero)
          ========================================================= */}
      <section aria-label="Social proof" className="relative border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="container-page grid items-center gap-8 py-10 md:grid-cols-2 lg:grid-cols-[auto_1fr]">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="stat-num">42K+</div>
              <p className="mt-1 text-sm font-medium text-slate-600">Active finders</p>
            </div>
            <div>
              <div className="stat-num">12,430</div>
              <p className="mt-1 text-sm font-medium text-slate-600">Items returned</p>
            </div>
            <div>
              <div className="stat-num">81</div>
              <p className="mt-1 text-sm font-medium text-slate-600">Provinces covered</p>
            </div>
            <div>
              <div className="stat-num flex items-center gap-1 text-left">
                <span>4.9</span>
                <span className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-600">User trust rating</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-x-10 gap-y-4 text-slate-400 md:justify-end">
            <p className="w-full text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-400 md:w-auto md:text-left">
              🇵🇭 Loved everywhere in Pinas
            </p>
            {["UP Diliman", "ADMU", "DLSU", "UST", "SM Malls", "Grab PH"].map((x) => (
              <span
                key={x}
                className="text-base font-extrabold tracking-tight text-slate-400/80 transition hover:text-slate-700"
              >
                {x}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES (Browse by category)
          ========================================================= */}
      <section id="categories" className="container-page py-20">
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow">Browse by category</span>
          <h2 className="mt-4 section-title max-w-2xl text-pretty">
            Walang naiiwan. Find the exact type of item.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            From tech to textbooks, from jewelries to jeep keys — filter 16,000+ live reports by the thing
            you&apos;re actually looking for.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {CATS.map(({ name, Icon, hue }) => (
            <Link
              key={name}
              href={`/lost?category=${encodeURIComponent(name)}`}
              className={`card-hover flex min-h-[110px] flex-col items-center justify-center gap-2.5 border bg-gradient-to-br ${hue} p-4 text-center`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                <Icon size={22} />
              </div>
              <span className="text-sm font-bold">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          3-STEP HOW IT WORKS (big numbers)
          ========================================================= */}
      <section id="how" className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)]"
        />
        <div className="container-page py-20">
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow">How FindBack works</span>
            <h2 className="mt-4 section-title max-w-3xl text-pretty">
              From lost to found in 3 simple steps.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              We took the most confusing parts of the lost-and-found process and designed them out.
              No group chats, no Facebook feeds, no reposts. Just your item back — faster.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                n: "01",
                title: "Report in under 2 minutes",
                body: "Drop photos, pick a category, pin where it happened. Add optional serials and marks — they stay hidden until verification time.",
                Icon: Sparkles,
                tone: "from-rose-500 to-pink-600",
              },
              {
                n: "02",
                title: "AI gets to work immediately",
                body: "Every new post triggers the matcher. If there&apos;s a hit, both sides get a push notification with a match score — so you act fast.",
                Icon: Bot,
                tone: "from-indigo-500 to-violet-600",
              },
              {
                n: "03",
                title: "Verify safely, then reunite",
                body: "Claimants answer the questions only a real owner can. When verified, use our in-app chat + handover checklist to meet up in a well-lit public place.",
                Icon: ShieldCheck,
                tone: "from-emerald-500 to-teal-600",
              },
            ].map((s) => (
              <div key={s.n} className="card-hover relative overflow-hidden p-8">
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-[0.12] blur-2xl"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />
                <div className={`relative inline-flex bg-gradient-to-br ${s.tone} bg-clip-text text-6xl font-black tracking-tighter text-transparent`}>
                  {s.n}
                </div>
                <div className={`relative mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-lg`}>
                  <s.Icon size={22} />
                </div>
                <h3 className="relative mt-5 text-xl font-extrabold tracking-tight text-slate-900">{s.title}</h3>
                <p className="relative mt-2 leading-relaxed text-slate-600">{s.body}</p>
                <Link href="/how-it-works" className="relative mt-5 inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900">
                  See full 5-step flow <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          6 FEATURE GRID
          ========================================================= */}
      <section id="features" className="container-page py-20">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Why FindBack PH</span>
            <h2 className="mt-4 section-title max-w-3xl text-pretty">
              Everything you need — and none of the things you don&apos;t.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-slate-600 lg:col-span-5">
            Ditch repost chains and Facebook groups that get lost in feeds. FindBack is built from scratch for
            this one job — with privacy, speed and Pinoy commuter life baked into every screen.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body, tone }, i) => (
            <div key={title} className="card-hover group p-7">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon size={22} />
              </div>
              <h3 className="mt-6 text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{body}</p>
              <div className="mt-6 h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all group-hover:w-full" />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -bottom-20 h-44 w-44 rounded-full opacity-[0.07]"
                style={{ background: `linear-gradient(135deg, ${i})` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          RECENTLY REPORTED (Live feed)
          ========================================================= */}
      <section id="live" className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(139,92,246,0.09),transparent_70%)]"
        />
        <div className="container-page py-20">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Live · Updated every 15 seconds</span>
              <h2 className="mt-4 section-title max-w-2xl text-pretty">
                Latest items reported across the country.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                Real posts by real Filipinos. See something yours? Tap the card and start the verification flow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {showNotification && (
                <button
                  onClick={refresh}
                  className="animate-pulse rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
                >
                  🔔 {newItemsCount} new · Click to refresh
                </button>
              )}
              <Link href="/lost" className="btn-secondary">
                Browse all <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[330px] animate-pulse rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-slate-100"
                />
              ))}
            </div>
          ) : items.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((i) => (
                <ItemCard item={parseCardItem(i)} key={i.id} />
              ))}
            </div>
          ) : (
            <div className="card mt-10 p-12 text-center text-slate-600">
              <p className="text-lg">No reports yet in your feed.</p>
              <Link href="/report/found" className="btn-primary mt-4">
                Be the first to post a found item →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          TESTIMONIALS (real Pinoy stories)
          ========================================================= */}
      <section id="stories" className="container-page py-20">
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow">Stories from the community</span>
          <h2 className="mt-4 section-title max-w-3xl text-pretty">
            &quot;Akala ko gone na. But it came back.&quot;
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Real stories from real users across the Philippines — from Manila to Zamboanga, from students
            to OFWs — who got something back because someone cared enough to post.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <figure key={t.name} className="card-hover relative flex flex-col justify-between p-8">
              <div className="absolute right-6 top-6 text-5xl font-black leading-none text-indigo-100 select-none">
                “
              </div>
              <div className={`mb-6 inline-flex items-center gap-0.5 text-amber-500`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <blockquote className="relative text-[15px] leading-relaxed text-slate-700">
                {t.quote}
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-black text-white shadow-md ${t.tone}`}
                  style={{ animationDelay: `${idx * 0.2}s` }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/how-it-works#stories" className="btn-secondary">
            <Play size={15} className="text-indigo-600" /> Watch more recovery stories
          </Link>
        </div>
      </section>

      {/* =========================================================
          USE CASES (everyone wins)
          ========================================================= */}
      <section id="for-you" className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(16,185,129,0.08),transparent_70%)]"
        />
        <div className="container-page py-20">
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow">Built for every kind of Pinoy</span>
            <h2 className="mt-4 section-title max-w-3xl text-pretty">
              Works everywhere you go — from classrooms to airport terminals.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(({ Icon, title, body }) => (
              <div key={title} className="card-hover p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA BANNER (gradient)
          ========================================================= */}
      <section className="container-page pb-20">
        <div className="relative isolate overflow-hidden rounded-[36px] bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 px-8 py-16 text-center shadow-[0_40px_100px_-40px_rgba(124,58,237,0.7)] sm:px-14 sm:py-20">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 10%, #ffffff 0, transparent 40%), radial-gradient(circle at 80% 90%, #ffffff 0, transparent 40%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid-lines opacity-40"
            style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)" }}
          />
          <span className="pill border-white/25 bg-white/10 text-white">
            ✨ Start a post in under 2 minutes
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            May nawala? May nahanap? <br className="hidden sm:block" />
            Huwag nang maghintay.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
            Don&apos;t let a phone, wallet, or memory become just another story. Take 2 minutes right now — and make the next reunion yours.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/report/lost" className="rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-50">
              🔴 I lost something
            </Link>
            <Link href="/report/found" className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-extrabold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
              💙 I found something
            </Link>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-xs text-white/70">
            🔒 100% free for the community · No ads on your item photos · Your email &amp; number stay private until you choose to share.
          </p>
        </div>
      </section>
    </main>
  );
}
