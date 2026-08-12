import { NextResponse } from "next/server";
import { currentUser, requireUser } from "@/lib/auth";
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

export async function POST(request: Request) {
  const user = await requireUser();
  try {
    const body = await request.json();
    const { conversationId, body: messageBody } = body;
    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }
    const text = String(messageBody ?? "").trim();
    if (!text) return NextResponse.json({ error: "Message body is empty" }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });
    if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = await db.message.create({
      data: { conversationId, senderId: user.id, body: text },
    });

    const otherId = conversation.participantAId === user.id ? conversation.participantBId : conversation.participantAId;
    await db.notification.create({
      data: {
        userId: otherId,
        title: "New message",
        body: `You received a new message.`,
        link: `/messages/${conversationId}`,
      },
    });

    return NextResponse.json({
      data: {
        id: message.id,
        body: message.body,
        sender_id: message.senderId,
        full_name: user.displayName,
        created_at: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
