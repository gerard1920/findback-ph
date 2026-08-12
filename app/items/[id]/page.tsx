"use client";

import Image from "next/image";
import { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, ShieldCheck, Tag, Palette, Award, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { startConversation } from "@/app/actions";

type Owner = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  campus: string | null;
};

type ItemDetail = {
  id: string;
  ownerId: string;
  title: string;
  type: "LOST" | "FOUND";
  status: string;
  description: string;
  city: string;
  province: string;
  barangay: string | null;
  approximateLocation: string;
  dateOccurred: string | Date;
  brand: string | null;
  color: string | null;
  distinguishingFeatures: string | null;
  reward: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string | Date;
  category: { id: string; name: string };
  owner: Owner;
  images: Array<{ id?: string; url: string; alt?: string | null }>;
  mine: boolean;
};

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || "Item not found.");
          return;
        }
        if (!cancelled) setItem(data.data as ItemDetail);
      } catch {
        if (!cancelled) setError("Unable to load this item.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function ownerAction(action: "recover" | "delete") {
    if (!item) return;
    if (action === "delete" && !window.confirm("Delete this report? This cannot be undone from the public site.")) return;
    startTransition(async () => {
      try {
        if (action === "delete") {
          const res = await fetch(`/api/items/${item.id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to delete.");
          }
          toast({
            variant: "success",
            title: "Report deleted",
            description: `"${item.title}" has been removed.`,
            durationMs: 2400,
          });
          router.push("/dashboard");
          return;
        }
        if (action === "recover") {
          const res = await fetch(`/api/items/${item.id}/recover`, {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to mark as recovered.");
          toast({
            variant: "success",
            title: item.type === "FOUND" ? "Marked as returned" : "Marked as recovered",
            description: `Great news! "${item.title}" has been marked resolved.`,
            durationMs: 3000,
          });
          setItem({ ...item, status: "RESOLVED" });
          router.refresh();
        }
      } catch (err) {
        toast({
          variant: "error",
          title: "Couldn't update",
          description: err instanceof Error ? err.message : "Please try again later.",
        });
      }
    });
  }

  function startClaimOrMessage() {
    if (!item) return;
    startTransition(async () => {
      try {
        await startConversation(item.id);
      } catch (err) {
        toast({
          variant: "error",
          title: "Couldn't start conversation",
          description: err instanceof Error ? err.message : "Please try again later.",
        });
      }
    });
  }

  if (error) {
    return (
      <main className="container-page py-20 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{error}</h1>
        <p className="mt-2 text-slate-500">It may have been removed, or the link is incorrect.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/lost" className="btn-primary">
            Browse lost items
          </Link>
          <Link href="/found" className="btn-secondary">
            Browse found items
          </Link>
        </div>
      </main>
    );
  }

  if (loading || !item) {
    return (
      <main className="container-page py-20 text-center text-slate-600">
        <div className="mx-auto grid place-items-center">
          <Spinner size="md" />
          <p className="mt-4 text-sm">Loading item…</p>
        </div>
      </main>
    );
  }

  const found = item.type === "FOUND";
  const resolved = item.status === "RESOLVED" || item.status === "REMOVED";

  const locationParts = [item.approximateLocation, item.barangay, item.city, item.province]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="container-page py-10">
      {resolved && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">This report has been closed.</p>
            <p className="mt-0.5 text-emerald-800/80">
              {item.status === "RESOLVED"
                ? `${item.type === "FOUND" ? "The item has been returned to its owner." : "The owner has recovered their item."}`
                : "This report is no longer public."}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-4">
          <div className="card overflow-hidden">
            {item.images.length > 1 ? (
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                {item.images.map((img, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={img.url}
                      alt={img.alt || item.title}
                      width={800}
                      height={800}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-square bg-slate-100">
                {item.images[0] ? (
                  <Image
                    src={item.images[0].url}
                    alt={item.images[0].alt || item.title}
                    width={800}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-slate-400">
                    No photo provided
                  </div>
                )}
              </div>
            )}
          </div>

          {item.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {item.images.map((img, idx) => (
                <div key={idx} className="h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200">
                  <Image src={img.url} alt={img.alt || `${item.title} ${idx + 1}`} width={160} height={160} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ring-black/5 ${found ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {item.type}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-black/5 ${resolved ? "bg-slate-100 text-slate-700" : item.status === "MATCHED" ? "bg-indigo-100 text-indigo-700" : item.status === "CLAIM_PENDING" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
              {resolved ? "Closed" : item.status === "MATCHED" ? "Possible match" : item.status === "CLAIM_PENDING" ? "Claim in review" : "Active"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-2 text-slate-600">
            {item.category.name} · Reported by{" "}
            <Link href={`/users/${item.owner.id}`} className="font-semibold text-indigo-700 hover:underline">
              {item.owner.displayName}
            </Link>
            {item.owner.campus && (
              <span className="ml-1 text-slate-400">· {item.owner.campus}</span>
            )}
          </p>

          <div className="mt-7 space-y-3 text-sm">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 shrink-0 text-indigo-700" size={18} />
              <span className="text-slate-700">{locationParts}</span>
            </p>
            <p className="flex gap-3">
              <CalendarDays className="mt-0.5 shrink-0 text-indigo-700" size={18} />
              <span className="text-slate-700">
                {new Date(item.dateOccurred).toLocaleDateString("en-PH", {
                  dateStyle: "long",
                })}
              </span>
            </p>
            {item.brand && (
              <p className="flex gap-3">
                <Tag className="mt-0.5 shrink-0 text-indigo-700" size={18} />
                <span className="text-slate-700">{item.brand}</span>
              </p>
            )}
            {item.color && (
              <p className="flex gap-3">
                <Palette className="mt-0.5 shrink-0 text-indigo-700" size={18} />
                <span className="text-slate-700">{item.color}</span>
              </p>
            )}
            {item.reward && (
              <p className="flex gap-3">
                <Award className="mt-0.5 shrink-0 text-amber-600" size={18} />
                <span className="font-semibold text-amber-800">{item.reward}</span>
              </p>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-navy-900">Description</h2>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="whitespace-pre-wrap text-base leading-[1.9] text-slate-800">{item.description}</p>
            </div>
          </div>

          {item.distinguishingFeatures && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <h3 className="text-sm font-bold text-amber-900">Distinguishing marks</h3>
              <p className="mt-2 whitespace-pre-wrap text-base leading-[1.9] text-amber-900/90">{item.distinguishingFeatures}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {item.mine ? (
              <>
                <Link href={`/items/${item.id}/edit`} className="btn-primary inline-flex items-center gap-1.5">
                  Edit report
                </Link>
                {!resolved && (
                  <button disabled={pending} onClick={() => ownerAction("recover")} className="btn-secondary inline-flex items-center gap-1.5">
                    {pending ? <Spinner size="sm" /> : null}
                    Mark as {found ? "returned" : "recovered"}
                  </button>
                )}
                <button disabled={pending} onClick={() => ownerAction("delete")} className="btn-rose inline-flex items-center gap-1.5">
                  Delete report
                </button>
              </>
            ) : (
              <>
                {!resolved && (
                  <button disabled={pending} onClick={startClaimOrMessage} className="btn-primary inline-flex items-center gap-1.5">
                    {pending ? <Spinner size="sm" /> : <MessageSquare size={16} />}
                    {found ? "Claim this item" : "Contact owner"}
                  </button>
                )}
                <Link href={`/report-abuse?item=${encodeURIComponent(item.id)}`} className="btn-ghost inline-flex items-center gap-1.5">
                  Report abuse
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            <span>
              <strong>Safe handover:</strong> Never send money, passwords, OTPs, or your home address. Meet in a public place and verify ownership before handing anything over.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
