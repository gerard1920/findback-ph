import { activeUser } from "@/lib/auth";import { SuspendedNotice } from "@/components/suspended-notice";
import { db } from "@/lib/db";
import { reviewClaim } from "@/app/actions";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function Claims() {
  const _a = await activeUser();
  if (!_a.ok) return <SuspendedNotice reason={_a.reason} message={_a.message} />;
  const user = _a.user;
  const claims = await db.claim.findMany({
    where: { item: { ownerId: user.id } },
    orderBy: { createdAt: "desc" },
  });
  const itemIds = claims.map((c) => c.itemId);
  const [items, claimants] = await Promise.all([
    db.item.findMany({ where: { id: { in: itemIds } }, select: { id: true, title: true, status: true } }),
    db.user.findMany({ where: { id: { in: claims.map((c) => c.claimantId) } }, select: { id: true, displayName: true } }),
  ]);
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const names = new Map(claimants.map((u) => [u.id, u.displayName]));
  return (
    <main className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Claims to review</h1>
      <p className="mt-2 text-slate-600">People who say they think a found item you reported belongs to them. Review their details privately before approving.</p>
      <div className="mt-7 space-y-4">
        {claims.length ? (
          claims.map((c) => {
            const item = itemsById.get(c.itemId);
            const reviewable = c.status === "PENDING" || c.status === "UNDER_REVIEW";
            return (
              <article className="card p-5" key={c.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{item?.title ?? "Item"}</b>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusStyles[c.status]}`}>{c.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">Claimant: {names.get(c.claimantId) ?? "User"}</p>
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">“{c.verificationAnswer}”</p>
                <p className="mt-2 text-xs text-slate-400">
                  Submitted {c.createdAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {reviewable ? (
                  <div className="mt-4 flex gap-2">
                    <form action={reviewClaim.bind(null, c.id, "APPROVED")}><button className="btn-primary">Approve</button></form>
                    <form action={reviewClaim.bind(null, c.id, "REJECTED")}><button className="btn-secondary">Reject</button></form>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">This claim has already been {c.status.toLowerCase()}.</p>
                )}
              </article>
            );
          })
        ) : (
          <div className="card p-10 text-center text-slate-600">
            No claims yet. When someone verifies a found item you reported, their claim will appear here.
          </div>
        )}
      </div>
    </main>
  );
}

