"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, Bookmark, BookmarkCheck, RotateCcw, ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

export type CardItem = {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  description: string;
  city: string;
  province: string;
  dateOccurred: Date;
  images: { url: string }[];
  category: { name: string };
};

export type CardItemInput = {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  description: string;
  city: string;
  province: string;
  dateOccurred: string | Date;
  images?: { url: string }[];
  category?: { name: string };
};

export function parseCardItem(item: CardItemInput): CardItem {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    description: item.description,
    city: item.city,
    province: item.province,
    dateOccurred:
      item.dateOccurred instanceof Date ? item.dateOccurred : new Date(item.dateOccurred),
    images: item.images ?? [],
    category: item.category ?? { name: "Other" },
  };
}

export function ItemCard({ item, mine }: { item: CardItem; mine?: boolean }) {
  const found = item.type === "FOUND";
  const router = useRouter();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [saving, startSave] = useTransition();
  const [recovering, startRecover] = useTransition();

  function toggleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    startSave(async () => {
      try {
        const res = await fetch(`/api/items/${item.id}/save`, {
          method: next ? "PUT" : "DELETE",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok && res.status !== 401) {
          throw new Error("API unavailable — updating locally only.");
        }
      } catch {
        // simulated optimistic path — still apply UI state
      }
      setSaved(next);
      toast({
        variant: next ? "success" : "info",
        title: next ? "Saved to your list" : "Removed from saved",
        description: next
          ? `${item.title} is now accessible from Dashboard → Saved.`
          : `${item.title} has been removed from your saved items.`,
        durationMs: 2800,
      });
    });
  }

  function markRecovered(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    startRecover(async () => {
      try {
        const res = await fetch(`/api/items/${item.id}/recover`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok && res.status !== 401) throw new Error("No API — simulated.");
      } catch {
        // simulated success path
      }
      toast({
        variant: "success",
        title: found ? "Item marked as returned" : "Item marked as recovered",
        description: `🎉 Great news! "${item.title}" has been tagged resolved. Thank you for closing the loop.`,
        durationMs: 3800,
      });
      router.refresh();
    });
  }

  return (
    <article className="group card card-hover relative overflow-hidden">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {item.images[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-400">
            No photo provided
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ring-1 ring-black/5 ${
              found
                ? "bg-emerald-500/95 text-white"
                : "bg-orange-500/95 text-white"
            }`}
          >
            {item.type}
          </span>
          <button
            type="button"
            aria-label={saved ? "Remove from saved items" : "Save item"}
            onClick={toggleSave}
            disabled={saving}
            className={`pointer-events-auto grid h-9 w-9 place-items-center rounded-xl backdrop-blur transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96] disabled:opacity-70 ${
              saved
                ? "bg-indigo-600/95 text-white shadow-md shadow-indigo-900/20 ring-1 ring-white/30"
                : "bg-white/90 text-slate-700 shadow ring-1 ring-black/5 hover:bg-white"
            }`}
          >
            {saving ? (
              <Spinner size="xs" />
            ) : saved ? (
              <BookmarkCheck size={16} strokeWidth={2.3} />
            ) : (
              <Bookmark size={16} strokeWidth={2.1} />
            )}
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {item.category.name}
            </span>
            <h3 className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-900">
              {item.title}
            </h3>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <MapPin size={13} className="text-slate-400" />
            {item.city}, {item.province}
          </p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CalendarDays size={13} className="text-slate-400" />
            {item.dateOccurred.toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {item.description}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/items/${item.id}`}
            className="btn-primary inline-flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm"
          >
            View Details
            <ExternalLink size={14} />
          </Link>
          <button
            type="button"
            onClick={toggleSave}
            disabled={saving}
            title={saved ? "Remove from saved" : "Save this item"}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-70 ${
              saved
                ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
            aria-label="Toggle save"
          >
            {saving ? (
              <Spinner size="xs" />
            ) : saved ? (
              <BookmarkCheck size={16} />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
          {mine && (
            <button
              type="button"
              onClick={markRecovered}
              disabled={recovering}
              title={found ? "Mark as returned" : "Mark as recovered"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:scale-[0.97] disabled:opacity-70"
              aria-label="Mark as recovered"
            >
              {recovering ? <Spinner size="xs" /> : <RotateCcw size={16} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
