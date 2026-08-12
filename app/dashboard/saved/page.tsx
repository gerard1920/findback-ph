import Link from "next/link";
import { activeUser } from "@/lib/auth";
import { SuspendedNotice } from "@/components/suspended-notice";
import { db } from "@/lib/db";
import { ItemCard } from "@/components/item-card";
import { unsaveItem } from "@/app/actions";

export default async function SavedItems() {
  const _a = await activeUser();
  if (!_a.ok) return <SuspendedNotice reason={_a.reason} message={_a.message} />;
  const user = _a.user;
  const saved = await db.savedItem.findMany({
    where: { userId: user.id },
    include: { item: { include: { images: { take: 1 }, category: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <main className="container-page py-10">
      <h1 className="text-3xl font-bold">Saved items</h1>
      <p className="mt-2 text-slate-600">Items you saved to check later.</p>
      {saved.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => (
            <div className="relative" key={s.itemId}>
              <ItemCard item={s.item} mine={false} />
              <form action={unsaveItem.bind(null, s.item.id)} className="absolute right-3 top-3 z-10">
                <button className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-white">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center">
          <p className="text-slate-600">No saved items yet.</p>
          <Link className="btn-primary mt-4" href="/lost">Browse lost items</Link>
        </div>
      )}
    </main>
  );
}
