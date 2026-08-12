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
  Play,
} from "lucide-react";
import { ItemCard, parseCardItem, type CardItemInput } from "@/components/item-card";
import { AutoRefreshItems } from "@/components/auto-refresh-items";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const CATS: { name: string; Icon: typeof Smartphone; href: string }[] = [
  { name: "Electronics", Icon: Smartphone, href: "/lost?category=Electronics" },
  { name: "Wallets", Icon: Wallet, href: "/lost?category=Wallets" },
  { name: "IDs & Documents", Icon: FileText, href: "/lost?category=IDs%20%26%20Documents" },
  { name: "Bags", Icon: Backpack, href: "/lost?category=Bags" },
  { name: "Keys", Icon: KeyRound, href: "/lost?category=Keys" },
  { name: "Jewelry", Icon: Gem, href: "/lost?category=Jewelry" },
  { name: "Vehicle Items", Icon: CarFront, href: "/lost?category=Vehicle%20Items" },
  { name: "School Items", Icon: BookOpen, href: "/lost?category=School%20Items" },
  { name: "Other", Icon: Package, href: "/lost" },
];

const FEATURES: {
  Icon: typeof Bot;
  title: string;
  body: string;
  className: string;
}[] = [
  {
    Icon: Bot,
    title: "AI-powered instant matching",
    body: "Our matcher scans every new found item against your lost report within seconds — by category, photos, description, and location. You’re notified the instant a possible match goes live.",
    className: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  },
  {
    Icon: Lock,
    title: "Private ownership verification",
    body: "Serial numbers, scratches, and private marks are never shown publicly. Claimants must describe unique details only the real owner would know — before any contact info is exchanged.",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  {
    Icon: MapPin,
    title: "Map-pinned barangay-level accuracy",
    body: "Report by province, city, barangay, and landmark. Filter results by distance from your location so you only see what matters in Metro Manila, Cebu, Davao — or any barangay in between.",
    className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  },
  {
    Icon: MessageCircle,
    title: "Secure in-app messaging",
    body: "Chats are kept on-platform so there’s always a paper trail. No one sees your real phone number or email until you decide to hand the item over. Safer for everyone.",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  {
    Icon: ShieldCheck,
    title: "Trust & safety, built-in",
    body: "Community reports, scam flags, verified profiles, and a 10-point safe-handover checklist help you meet up in public spots with confidence — every single time.",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  {
    Icon: Gift,
    title: "Flexible reward incentives",
    body: "Offer a cash reward, a happy meal, a bayad-pasok fare — whatever feels right for the person who returns what’s yours. We never take a cut.",
    className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
];

const TESTIMONIALS: {
  quote: string;
  name: string;
  role: string;
  location: string;
  initial: string;
  className: string;
}[] = [
  {
    quote:
      "I left my laptop in a UV Express from Cubao to Fairview. I posted it here at 10pm, had 3 match suggestions by midnight, and got it back the next morning after verifying serial number + sticker. Salamat talaga, FindBack!",
    name: "Angela Reyes",
    role: "Freelance graphic designer",
    location: "Quezon City",
    initial: "A",
    className: "bg-rose-500 text-white",
  },
  {
    quote:
      "Found a student’s school bag with a full set of textbooks at SM Seaside. I posted it, used the verification questions (they had to name two subjects + the doodle on the pencil case), and handed it over at the info desk two hours later.",
    name: "Mark Villanueva",
    role: "Restaurant floor manager",
    location: "Cebu City",
    initial: "M",
    className: "bg-sky-500 text-white",
  },
  {
    quote:
      "Lumipad yung phone ko sa habulan ng jeep sa Monumento. Akala ko gone na forever — I got a notification 3 days later: a kind tsuper from Marikina turned it in. We met at the LTO office, verified the IMEI, and my sim + memories are back. 🥹",
    name: "Joanna Santos",
    role: "College senior, PUP",
    location: "Caloocan City",
    initial: "J",
    className: "bg-violet-500 text-white",
  },
];

const USE_CASES: {
  Icon: typeof GraduationCap;
  title: string;
  body: string;
}[] = [
  { Icon: GraduationCap, title: "Students & campuses", body: "Lost IDs, textbooks, lab gowns, laptops inside the library — post your campus and every student org sees it." },
  { Icon: ShoppingBag, title: "Malls & restos", body: "From MOA food court trays to forgotten coffee-shop planners, most found wallets get claimed in under 4 hours." },
  { Icon: Briefcase, title: "Offices & commuters", body: "BGC, Makati, Ortigas UV Express, MRT3, P2P buses — finders and losers find each other by route, not just city." },
  { Icon: Plane, title: "Travelers & airports", body: "NAIA Terminal 3, Clark, Cebu Pac seats, Grab drop-offs: tag your flight number or plate for faster matches." },
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
    async function loadItems() {
      setLoading(true);
      try {
        const res = await fetch("/api/items/recent", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
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
    const res = await fetch("/api/items/recent", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
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
    <main className="min-h-screen bg-white">
      <AutoRefreshItems
        onNewItems={(n) => {
          setNewItemsCount(n);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 6000);
        }}
        interval={15000}
      />

      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="eyebrow">FindBack PH</span>
              <h1 className="mt-5 section-title text-pretty">
                Find what was lost.
                <span className="block text-indigo-700">Return what was found.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                FindBack PH connects people across the Philippines to help lost belongings find their way home. Report in under 2 minutes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/report/lost" className="btn-lost justify-center px-7 py-4 text-base">
                  Report Lost Item
                  <ChevronRight size={18} />
                </Link>
                <Link href="/report/found" className="btn-found justify-center px-7 py-4 text-base">
                  Report Found Item
                  <ChevronRight size={18} />
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> Free to use</span>
                <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> Posts go live instantly</span>
                <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> Private by default</span>
              </div>

              <form
                onSubmit={onHeroSearch}
                noValidate
                className="mt-10 grid gap-3 sm:grid-cols-[2fr_1.2fr_auto]"
              >
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-1 ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    name="q"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    aria-label="What are you searching for?"
                    className="m-0 h-auto border-0 bg-transparent p-3 shadow-none focus:ring-0"
                    placeholder="iPhone, black wallet, UMID, student ID…"
                  />
                </div>
                <input
                  name="city"
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  placeholder="Quezon City · Cebu · Davao…"
                  className="m-0 bg-white transition-all duration-200"
                />
                <button
                  type="submit"
                  className="btn-primary justify-center py-3 text-base"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="lg:col-span-5">
              <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop"
                    alt="Found item preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <span className="pill-found">FOUND</span>
                  <h4 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Black iPhone 15 Pro, red case
                  </h4>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                    Found near Starbucks North Wing at 4pm. Minor scratch on bottom right. Finder: “Willing to meet at info desk only.”
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-slate-500">Near MOA, Pasay · 2h ago</span>
                    <span className="text-xs font-bold text-indigo-700">View claim flow →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST STATS
          ========================================================= */}
      <section aria-label="Trust stats" className="border-b border-slate-200 bg-white">
        <div className="container-page py-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-700 sm:text-4xl">Free to use</div>
              <p className="mt-1 text-sm font-medium text-slate-600">No fees, no ads on your posts</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-700 sm:text-4xl">Private by default</div>
              <p className="mt-1 text-sm font-medium text-slate-600">Your contact info stays hidden</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-700 sm:text-4xl">Posts go live instantly</div>
              <p className="mt-1 text-sm font-medium text-slate-600">No waiting for approval</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-700 sm:text-4xl">Secure messaging</div>
              <p className="mt-1 text-sm font-medium text-slate-600">Chat safely without sharing numbers</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
          ========================================================= */}
      <section id="categories" className="container-page py-16">
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow">Browse by category</span>
          <h2 className="mt-4 section-title max-w-2xl text-pretty">
            Find the exact type of item.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            From tech to textbooks, from jewelry to keys — filter live reports by the thing you’re actually looking for.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {CATS.map(({ name, Icon, href }) => (
            <Link
              key={name}
              href={href}
              className="card-hover flex min-h-[110px] flex-col items-center justify-center gap-2.5 p-4 text-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                <Icon size={22} />
              </div>
              <span className="text-sm font-bold text-slate-900">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
          ========================================================= */}
      <section id="how" className="border-t border-slate-200 bg-slate-50">
        <div className="container-page py-16">
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow">How FindBack works</span>
            <h2 className="mt-4 section-title max-w-3xl text-pretty">
              From lost to found in 3 simple steps.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              We took the most confusing parts of lost-and-found and designed them out.
              No group chats, no reposts. Just your item back — faster.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                n: "01",
                title: "Report in under 2 minutes",
                body: "Drop photos, pick a category, pin where it happened. Add optional serials and marks — they stay hidden until verification time.",
                Icon: Sparkles,
                className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
              },
              {
                n: "02",
                title: "AI gets to work immediately",
                body: "Every new post triggers the matcher. If there’s a hit, both sides get notified with a match score so you act fast.",
                Icon: Bot,
                className: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
              },
              {
                n: "03",
                title: "Verify safely, then reunite",
                body: "Claimants answer questions only a real owner can. When verified, use our in-app chat + handover checklist to meet up in a well-lit public place.",
                Icon: ShieldCheck,
                className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
              },
            ].map((s) => (
              <div key={s.n} className="card p-8">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${s.className}`}>
                  <s.Icon size={22} />
                </div>
                <div className="mt-5 text-sm font-bold text-slate-500">{s.n}</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{s.title}</h3>
                <p className="relative mt-2 leading-relaxed text-slate-600">{s.body}</p>
                <Link href="/how-it-works" className="relative mt-5 inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900">
                  See full flow <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          6 FEATURE GRID
          ========================================================= */}
      <section id="features" className="container-page py-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Why FindBack PH</span>
            <h2 className="mt-4 section-title max-w-3xl text-pretty">
              Built for one job: getting your stuff back.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-slate-600 lg:col-span-5">
            Ditch repost chains and Facebook groups that get lost in feeds. FindBack is built for this one job — with privacy, speed, and Pinoy commuter life baked into every screen.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body, className }) => (
            <div key={title} className="card p-7">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}>
                <Icon size={22} />
              </div>
              <h3 className="mt-6 text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          RECENTLY REPORTED (Live feed)
          ========================================================= */}
      <section id="live" className="border-t border-slate-200 bg-slate-50">
        <div className="container-page py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Live feed</span>
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
                  className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
                >
                  {newItemsCount} new · Click to refresh
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
                  className="skeleton h-[330px] rounded-3xl"
                />
              ))}
            </div>
          ) : items.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((i) => (
                <ItemCard item={parseCardItem(i)} mine={false} key={i.id} />
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
          TESTIMONIALS
          ========================================================= */}
      <section id="stories" className="container-page py-16">
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow">Stories from the community</span>
          <h2 className="mt-4 section-title max-w-3xl text-pretty">
            “Akala ko gone na. But it came back.”
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Real stories from real users across the Philippines — from Manila to Zamboanga, from students
            to OFWs — who got something back because someone cared enough to post.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card p-8">
              <div className="mb-6 flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <blockquote className="relative text-[15px] leading-relaxed text-slate-700">
                {t.quote}
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-base font-black text-white shadow-md ${t.className}`}
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
          <Link href="/how-it-works" className="btn-secondary">
            <Play size={15} className="text-indigo-600" /> See how it works
          </Link>
        </div>
      </section>

      {/* =========================================================
          USE CASES
          ========================================================= */}
      <section id="for-you" className="border-t border-slate-200 bg-slate-50">
        <div className="container-page py-16">
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow">Built for every kind of Pinoy</span>
            <h2 className="mt-4 section-title max-w-3xl text-pretty">
              Works everywhere you go — from classrooms to airport terminals.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(({ Icon, title, body }) => (
              <div key={title} className="card p-6">
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
          FINAL CTA
          ========================================================= */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center shadow-sm sm:px-14 sm:py-20">
          <span className="pill border-white/20 bg-white/10 text-white">
            Start a post in under 2 minutes
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            May nawala? May nahanap?
            <span className="block">Huwag nang maghintay.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
            Don’t let a phone, wallet, or memory become just another story. Take 2 minutes right now — and make the next reunion yours.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/report/lost" className="rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
              I lost something
            </Link>
            <Link href="/report/found" className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-extrabold text-white backdrop-blur transition hover:bg-white/20">
              I found something
            </Link>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-xs text-white/70">
            100% free for the community · No ads on your item photos · Your email & number stay private until you choose to share.
          </p>
        </div>
      </section>
    </main>
  );
}
