import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ItemCard } from "@/components/item-card";
import { unsaveItem } from "@/app/actions";

export default async function SavedItems() {
  const user = await requireUser();
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
              <ItemCard item={s.item} />
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