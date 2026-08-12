import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ participantAId: user.id }, { participantBId: user.id }],
    },
    include: {
      item: { select: { id: true, title: true, type: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = conversations.map((c) => {
    const otherId = c.participantAId === user.id ? c.participantBId : c.participantAId;
    const last = c.messages[0];
    const unreadCount = c.messages.filter((m) => m.senderId !== user.id && !m.readAt).length;
    return {
      id: c.id,
      item_id: c.itemId,
      title: c.item?.title ?? "Conversation",
      created_at: c.createdAt.toISOString(),
      last_message_at: last?.createdAt.toISOString() ?? null,
      unread_count: unreadCount,
      other_user_id: otherId,
    };
  });

  return NextResponse.json({ data: { conversations: result } });
}
