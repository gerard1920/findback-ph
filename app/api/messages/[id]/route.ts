import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const conversation = await db.conversation.findUnique({ where: { id } });
    if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await db.message.updateMany({
      where: { conversationId: id, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark messages read:", error);
    return NextResponse.json({ error: "Unable to update messages." }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const result = conversation.messages.map((m) => ({
      id: m.id,
      body: m.body,
      sender_id: m.senderId,
      full_name: m.senderId === user.id ? "You" : "Other user",
      created_at: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ data: { messages: result } });
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return NextResponse.json({ error: "Unable to load messages." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const conversation = await db.conversation.findUnique({ where: { id } });
    if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const otherId = conversation.participantAId === user.id ? conversation.participantBId : conversation.participantAId;
    const blocked = await db.block.findFirst({
      where: { OR: [{ blockerId: otherId, blockedId: user.id }, { blockerId: user.id, blockedId: otherId }] },
    });
    if (blocked) {
      return NextResponse.json({ error: "You cannot message this user." }, { status: 403 });
    }

    let body: { body?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const text = String(body.body ?? "").trim();
    if (!text) return NextResponse.json({ error: "Message body is empty" }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

    const message = await db.message.create({
      data: { conversationId: id, senderId: user.id, body: text },
    });

    await db.notification.create({
      data: {
        userId: otherId,
        title: "New message",
        body: `You received a new message.`,
        link: `/messages/${id}`,
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
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
