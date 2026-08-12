import { activeUser } from "@/lib/auth";
import { SuspendedNotice } from "@/components/suspended-notice";
import { db } from "@/lib/db";
import { isDatabaseAvailable } from "@/lib/db";
import Link from "next/link";

export default async function Matches() {
  const _a = await activeUser();
  if (!_a.ok) {
    return <SuspendedNotice reason={_a.reason} message={_a.message} />;
  }
  const u = _a.user;

  if (!(await isDatabaseAvailable())) {
    return (
      <main className="container-page py-10">
        <h1 className="text-3xl font-bold">Possible matches</h1>
        <p className="mt-2 text-slate-600">
          We can’t load matches right now because the database is unavailable.
        </p>
      </main>
    );
  }

  let own: { id: string }[] = [];
  let matches: { id: string; lostItemId: string; foundItemId: string; score: number }[] = [];
  let items: { id: string; title: string; city: string; province: string }[] = [];
  let ids: string[] = [];
  try {
    own = await db.item.findMany({ where: { ownerId: u.id }, select: { id: true } });
    ids = own.map((x) => x.id);
    matches = await db.match.findMany({
      where: {
        OR: [
          { lostItemId: { in: ids } },
          { foundItemId: { in: ids } },
        ],
      },
      orderBy: { score: "desc" },
    });
    items = await db.item.findMany({
      where: {
        id: {
          in: [
            ...matches.map((m) => m.lostItemId),
            ...matches.map((m) => m.foundItemId),
          ],
        },
      },
      select: { id: true, title: true, city: true, province: true },
    });
  } catch {
    return (
      <main className="container-page py-10">
        <h1 className="text-3xl font-bold">Possible matches</h1>
        <p className="mt-2 text-slate-600">
          We couldn’t load your matches. Please try again later.
        </p>
      </main>
    );
  }

  const lookup = new Map(items.map((i) => [i.id, i]));
  return (
    <main className="container-page py-10">
      <h1 className="text-3xl font-bold">Possible matches</h1>
      <p className="mt-2 text-slate-600">
        Scores indicate similarity only — they do not confirm ownership.
      </p>
      <div className="mt-7 space-y-4">
        {matches.length ? (
          matches.map((m) => {
            const mine = ids.includes(m.lostItemId)
              ? lookup.get(m.lostItemId)
              : lookup.get(m.foundItemId);
            const other = ids.includes(m.lostItemId)
              ? lookup.get(m.foundItemId)
              : lookup.get(m.lostItemId);
            return (
              <article
                className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                key={m.id}
              >
                <div>
                  <span className="text-sm font-bold text-blue-700">
                    Possible match · {m.score}%
                  </span>
                  <p className="mt-2">
                    <b>Your report:</b> {mine?.title}
                  </p>
                  <p>
                    <b>Possible item:</b> {other?.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {other?.city}, {other?.province}
                  </p>
                </div>
                <Link className="btn-primary" href={`/items/${other?.id}`}>
                  View match
                </Link>
              </article>
            );
          })
        ) : (
          <div className="card p-10 text-center">
            No possible matches yet. We&apos;ll notify you when we find one.
          </div>
        )}
      </div>
    </main>
  );
}
