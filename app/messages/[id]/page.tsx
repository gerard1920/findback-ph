import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMessage } from "@/app/actions";

export default async function MessageThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect("/login");
  const conversation = await db.conversation.findUnique({ where: { id } });
  if (!conversation) notFound();
  if (conversation.participantAId !== user.id && conversation.participantBId !== user.id) redirect("/messages");
  const otherId = conversation.participantAId === user.id ? conversation.participantBId : conversation.participantAId;
  const [other, item, messages, unreadCount] = await Promise.all([
    db.user.findUnique({ where: { id: otherId }, select: { id: true, displayName: true } }),
    conversation.itemId ? db.item.findUnique({ where: { id: conversation.itemId }, select: { id: true, title: true } }) : null,
    db.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } }),
    db.message.count({ where: { conversationId: id, senderId: otherId, readAt: null } }),
  ]);
  if (unreadCount > 0) {
    await db.message.updateMany({
      where: { conversationId: id, senderId: otherId, readAt: null },
      data: { readAt: new Date() },
    });
  }
  return (
    <main className="container-page max-w-3xl py-10">
      <Link href="/messages" className="text-sm font-semibold text-blue-700">← All conversations</Link>
      <h1 className="mt-3 text-2xl font-bold">{other?.displayName ?? "User"}</h1>
      {item && (
        <p className="mt-1 text-sm text-slate-600">
          About: <Link className="text-blue-700 underline" href={`/items/${item.id}`}>{item.title}</Link>
        </p>
      )}
      <div className="card mt-6 flex min-h-72 flex-col gap-3 p-5">
        {messages.length ? (
          messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "self-end bg-blue-700 text-white" : "self-start bg-slate-100 text-slate-800"}`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-right text-[10px] ${mine ? "text-blue-100" : "text-slate-400"}`}>
                  {m.createdAt.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            );
          })
        ) : (
          <p className="m-auto text-slate-500">Send the first message to begin the conversation.</p>
        )}
      </div>
      <form action={sendMessage.bind(null, conversation.id)} className="card mt-4 flex gap-3 p-3">
        <input name="body" required maxLength={2000} autoComplete="off" placeholder="Write a safe, respectful message…" />
        <button className="btn-primary shrink-0">Send</button>
      </form>
    </main>
  );
}