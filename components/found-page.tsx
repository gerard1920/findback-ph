"use client";

import { useMemo, useState, useEffect } from "react";
import { ItemCard, parseCardItem, type CardItemInput } from "@/components/item-card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AutoRefreshItems } from "@/components/auto-refresh-items";
import { Search, MapPin, SortAsc, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

interface Category {
  id: string;
  name: string;
}

type SortId = "newest" | "oldest" | "nearest" | "alpha";
const SORTS: { id: SortId; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "nearest", label: "Nearest match" },
  { id: "alpha", label: "A → Z" },
];

const DEFAULT_CATS: Category[] = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "IDs & Cards" },
  { id: "3", name: "Wallets" },
  { id: "4", name: "Phones" },
  { id: "5", name: "Bags" },
  { id: "6", name: "Keys" },
  { id: "7", name: "Books" },
  { id: "8", name: "Jewelry" },
  { id: "9", name: "Documents" },
];

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 rounded-lg bg-slate-100" />
        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
        <div className="mt-2 grid grid-cols-3 gap-2 pt-2">
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function FoundClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialSort = (params.get("sort") as SortId | null) ?? "newest";
  const initialCat = params.get("category") ?? "";
  const initialQ = params.get("q") ?? "";
  const initialCity = params.get("city") ?? "";

  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState(initialCity);
  const [activeCat, setActiveCat] = useState<string>(initialCat);
  const [sort, setSort] = useState<SortId>(initialSort);
  const [items, setItems] = useState<CardItemInput[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        const query = initialQ;
        const c = initialCity;
        const cat = initialCat;
        if (query) sp.set("q", query);
        if (c) sp.set("city", c);
        if (cat) sp.set("category", cat);
        sp.set("type", "FOUND");
        const res = await fetch(`/api/items.php?${sp.toString()}`);
        if (res.ok) {
          const d = await res.json();
          setItems(d.data?.items ?? []);
          setCats((d.data?.categories as Category[] | undefined) ?? DEFAULT_CATS);
        } else {
          setCats(DEFAULT_CATS);
        }
      } catch {
        setCats(DEFAULT_CATS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialQ, initialCity, initialCat]);

  const displayableCats = cats.length ? cats : DEFAULT_CATS;

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    const clc = city.trim().toLowerCase();
    type Typed = CardItemInput & { category?: { name?: string } };
    let arr = items.filter((raw) => {
      const i = raw as Typed;
      if (activeCat) {
        const cn = i.category?.name ?? "";
        if (cn !== activeCat) return false;
      }
      if (qlc) {
        const cn = i.category?.name ?? "";
        const hay = `${i.title} ${i.description} ${i.city} ${i.province} ${cn}`.toLowerCase();
        if (!hay.includes(qlc)) return false;
      }
      if (clc) {
        const loc = `${i.city} ${i.province}`.toLowerCase();
        if (!loc.includes(clc)) return false;
      }
      return true;
    });
    arr = [...arr].sort((a, b) => {
      const da = new Date(a.dateOccurred).getTime();
      const db = new Date(b.dateOccurred).getTime();
      if (sort === "newest") return db - da;
      if (sort === "oldest") return da - db;
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (q.trim()) {
        const score = (s: string) => {
          const lower = q.trim().toLowerCase();
          return s.toLowerCase().indexOf(lower) === -1 ? 9999 : s.toLowerCase().indexOf(lower);
        };
        return score(a.title + a.description) - score(b.title + b.description);
      }
      return db - da;
    });
    return arr;
  }, [items, activeCat, q, city, sort]);

  function applyToUrl() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (city.trim()) sp.set("city", city.trim());
    if (activeCat) sp.set("category", activeCat);
    if (sort) sp.set("sort", sort);
    router.replace(`/found${sp.toString() ? "?" + sp.toString() : ""}`, { scroll: false });
  }

  function resetFilters() {
    setQ("");
    setCity("");
    setActiveCat("");
    setSort("newest");
    router.replace("/found", { scroll: false });
    toast({ variant: "info", title: "Filters cleared", durationMs: 1400 });
  }

  const refresh = async () => {
    const sp = new URLSearchParams();
    if (initialQ) sp.set("q", initialQ);
    if (initialCity) sp.set("city", initialCity);
    if (initialCat) sp.set("category", initialCat);
    sp.set("type", "FOUND");
    const res = await fetch(`/api/items.php?${sp.toString()}`);
    if (res.ok) {
      const d = await res.json();
      setItems(d.data?.items ?? []);
      setNewItemsCount(0);
      setShowNotification(false);
    }
  };

  return (
    <main className="container-page py-10" data-auto-refresh>
      <AutoRefreshItems
        onNewItems={(n) => {
          setNewItemsCount(n);
          setShowNotification(true);
          window.setTimeout(() => setShowNotification(false), 5000);
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow eyebrow--emerald">💙 Found items</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Reunite something you picked up
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Browse items turned in by our community. Filter by category and location, then help verify the real owner.
          </p>
        </div>
        {showNotification && (
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.97]"
          >
            <Loader2 size={15} className="animate-spin" />
            {newItemsCount} new {newItemsCount === 1 ? "post" : "posts"} — refresh
          </button>
        )}
      </div>

      {/* Search + sort bar */}
      <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1.4fr_1fr_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search found items</span>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={applyToUrl}
            placeholder="Phone, wallet, ID, keys…"
            className="pl-10"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                applyToUrl();
              }}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>
        <label className="relative block">
          <span className="sr-only">Location</span>
          <MapPin size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={applyToUrl}
            placeholder="Quezon City, Cebu, Davao…"
            className="pl-10"
          />
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <SortAsc size={15} className="text-slate-500" />
          <select
            value={sort}
            onChange={(e) => {
              const next = e.target.value as SortId;
              setSort(next);
              toast({
                variant: "info",
                title: "Updated",
                description: `Sorted by ${SORTS.find((s) => s.id === next)?.label}.`,
                durationMs: 1500,
              });
            }}
            className="flex-1 bg-transparent p-0 text-sm font-semibold text-slate-800 focus:ring-0 border-0 shadow-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="lg:hidden btn-secondary inline-flex items-center gap-1.5 justify-center"
            aria-expanded={filterOpen}
          >
            <X size={15} /> Filters
          </button>
          <button type="button" onClick={resetFilters} className="btn-ghost inline-flex items-center justify-center gap-1.5" title="Clear filters">
            <X size={15} /> Reset
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className={`mt-4 flex flex-wrap items-center gap-2 ${filterOpen ? "block" : "hidden lg:flex"}`}>
        <button
          type="button"
          onClick={() => {
            setActiveCat("");
            applyToUrl();
          }}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
            !activeCat
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-1 ring-white/20"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
          }`}
        >
          All items
        </button>
        {displayableCats.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => {
              setActiveCat((cur) => (cur === c.name ? "" : c.name));
              applyToUrl();
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
              activeCat === c.name
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-1 ring-white/20"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 font-bold text-slate-700 ring-1 ring-slate-200">
          {loading ? (
            <>
              <Spinner size="xs" /> Loading matches…
            </>
          ) : (
            <>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
              <span className="text-slate-400">·</span>
              {SORTS.find((s) => s.id === sort)?.label}
            </>
          )}
        </span>
        {activeCat && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
            Category: {activeCat}
            <button
              type="button"
              onClick={() => {
                setActiveCat("");
                applyToUrl();
              }}
              className="ml-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200"
            >
              <X size={11} />
            </button>
          </span>
        )}
        <Link
          href="/report/found"
          className="btn-primary btn-emerald ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          💙 Post a found item
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <ItemCard item={parseCardItem(i)} key={i.id} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 overflow-hidden p-10 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Search size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">No matching found items</h2>
          <p className="mt-2 text-sm text-slate-600">
            Try removing filters or reporting a new found item so owners can find you.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={resetFilters} className="btn-secondary px-4 py-2 text-sm">
              Clear filters
            </button>
            <Link href="/report/found" className="btn-primary btn-emerald px-4 py-2 text-sm">
              Post a found item
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
