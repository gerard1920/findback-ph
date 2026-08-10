import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Messages() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const conversations = await db.conversation.findMany({
    where: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const ids = conversations.map((c) => c.id);
  const counterpartIds = conversations.map((c) =>
    c.participantAId === user.id ? c.participantBId : c.participantAId
  );
  const itemIds = conversations.map((c) => c.itemId).filter((x): x is string => Boolean(x));
  const [users, items, unreadRows] = await Promise.all([
    db.user.findMany({ where: { id: { in: counterpartIds } }, select: { id: true, displayName: true } }),
    db.item.findMany({ where: { id: { in: itemIds } }, select: { id: true, title: true } }),
    db.message.findMany({
      where: { conversationId: { in: ids }, senderId: { not: user.id }, readAt: null },
      select: { conversationId: true },
    }),
  ]);
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  const itemsById = new Map(items.map((i) => [i.id, i.title]));
  const unread = new Map<string, number>();
  for (const r of unreadRows) unread.set(r.conversationId, (unread.get(r.conversationId) ?? 0) + 1);
  const sorted = conversations.sort(
    (a, b) =>
      (b.messages[0]?.createdAt.getTime() ?? b.createdAt.getTime()) -
      (a.messages[0]?.createdAt.getTime() ?? a.createdAt.getTime())
  );
  return (
    <main className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Messages</h1>
      <p className="mt-2 text-slate-600">Private conversations with other reporters.</p>
      <div className="mt-7 space-y-3">
        {sorted.length ? (
          sorted.map((c) => {
            const otherId = c.participantAId === user.id ? c.participantBId : c.participantAId;
            const last = c.messages[0];
            const n = unread.get(c.id) ?? 0;
            const stamp = (last ?? c).createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
            return (
              <Link
                href={`/messages/${c.id}`}
                className="card flex items-center justify-between gap-4 p-4 hover:border-blue-300"
                key={c.id}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <b>{names.get(otherId) ?? "User"}</b>
                    {n > 0 && (
                      <span className="rounded-full bg-blue-700 px-2 py-0.5 text-xs font-bold text-white">{n}</span>
                    )}
                  </div>
                  {c.itemId && itemsById.has(c.itemId) && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">About: {itemsById.get(c.itemId)}</p>
                  )}
                  <p className="mt-1 truncate text-sm text-slate-600">{last ? last.body : "Start the conversation."}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{stamp}</span>
              </Link>
            );
          })
        ) : (
          <div className="card p-10 text-center text-slate-600">
            No conversations yet. Open a listing and press “Contact reporter” to message the person who reported it.
          </div>
        )}
      </div>
    </main>
  );
}
