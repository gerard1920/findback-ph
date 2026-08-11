"use client";
import Link from "next/link";
import { useActionState } from "react";
import { markItemResolved, type FormState } from "@/app/actions";
import { Edit2, Trash2, CheckCircle2, Search, MapPin } from "lucide-react";

export type ActivityItem = {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  status: "ACTIVE" | "MATCHED" | "CLAIM_PENDING" | "RESOLVED" | "EXPIRED" | "REMOVED";
  province: string;
  city: string;
  approximateLocation: string;
  dateOccurred: string;
  createdAt: string;
  images: { id: string; url: string; alt: string | null }[];
};

const STATUS_BADGE: Record<ActivityItem["status"], { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  CLAIM_PENDING: { label: "Pending Verification", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  MATCHED: { label: "Possible Match", className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200" },
  RESOLVED: { label: "Claimed / Resolved", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" },
  EXPIRED: { label: "Expired", className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" },
  REMOVED: { label: "Removed", className: "bg-rose-50 text-rose-600 ring-1 ring-rose-200" },
};

function StatusBadge({ status }: { status: ActivityItem["status"] }) {
  const s = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {status === "RESOLVED" && <CheckCircle2 size={12} />}
      {s.label}
    </span>
  );
}

function ItemRow({ item, type }: { item: ActivityItem; type: "LOST" | "FOUND" }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(markItemResolved, {});
  const cover = item.images[0]?.url;
  const isResolved = item.status === "RESOLVED" || item.status === "REMOVED" || item.status === "EXPIRED";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start">
      <div className="shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Search size={28} />
            </div>
          )}
        </div>
        <div className="mt-2 text-center">
          <span
            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              type === "LOST" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
            }`}
          >
            {type === "LOST" ? "LOST" : "FOUND"}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <Link href={`/items/${item.id}`} className="font-semibold text-slate-900 hover:text-blue-700 hover:underline">
              {item.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><MapPin size={12} />{item.city}, {item.province}</span>
          <span>{item.approximateLocation}</span>
          <span>Occurred {new Date(item.dateOccurred).toLocaleDateString()}</span>
        </div>
        {state.success && (
          <p role="status" className="mt-2 rounded-md bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700">{state.success}</p>
        )}
        {state.error && (
          <p role="alert" className="mt-2 rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-700">{state.error}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link href={`/items/${item.id}/edit`} className="btn-secondary inline-flex items-center gap-1 !py-1.5 text-xs">
            <Edit2 size={14} /> Edit
          </Link>
          {!isResolved && (
            <form action={formAction} className="inline-flex">
              <input type="hidden" name="itemId" value={item.id} />
              <button type="submit" disabled={pending} className="btn-primary inline-flex items-center gap-1 !py-1.5 text-xs">
                <CheckCircle2 size={14} /> {pending ? "Saving…" : "Mark Resolved"}
              </button>
            </form>
          )}
          <form action="/api/items/delete" method="post" className="inline-flex">
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
              onClick={(e) => {
                if (!confirm("Delete this post? This cannot be undone.")) e.preventDefault();
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function MyActivityList({
  lostItems,
  foundItems,
}: {
  lostItems: ActivityItem[];
  foundItems: ActivityItem[];
}) {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Items reported as <span className="text-rose-600">LOST</span> <span className="ml-1 text-sm font-normal text-slate-500">({lostItems.length})</span></h3>
          <Link href="/report/lost" className="text-sm font-medium text-blue-700 hover:underline">+ Report lost item</Link>
        </div>
        {lostItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">You haven&apos;t reported any lost items yet.</p>
            <Link href="/report/lost" className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline">Report a lost item →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lostItems.map((item) => (
              <ItemRow key={item.id} item={item} type="LOST" />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Items reported as <span className="text-blue-600">FOUND</span> <span className="ml-1 text-sm font-normal text-slate-500">({foundItems.length})</span></h3>
          <Link href="/report/found" className="text-sm font-medium text-blue-700 hover:underline">+ Report found item</Link>
        </div>
        {foundItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">You haven&apos;t reported any found items yet.</p>
            <Link href="/report/found" className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline">Report a found item →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {foundItems.map((item) => (
              <ItemRow key={item.id} item={item} type="FOUND" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
