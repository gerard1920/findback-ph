/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notification-service";
import { publishToParticipants } from "@/lib/messaging-realtime";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const url = new URL(request.url);
    const query = String(url.searchParams.get("q") || "").trim().toLowerCase();

    const conversations = await db.conversation.findMany({
      where: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
      select: {
        id: true,
        itemId: true,
        participantAId: true,
        participantBId: true,
        pinnedByA: true,
        pinnedByB: true,
        createdAt: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true } },
        item: { select: { id: true, title: true, type: true } },
        _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const result: unknown[] = [];
    for (const c of conversations) {
      const other = await getOtherUser(c, user.id);
      if (query && !String(other?.displayName ?? "").toLowerCase().includes(query) && !(c.item?.title ?? "").toLowerCase().includes(query)) continue;
      const pinned = c.participantAId === user.id ? c.pinnedByA : c.pinnedByB;
      result.push({
        id: c.id,
        item_id: c.itemId,
        item_title: c.item?.title ?? null,
        title: other?.displayName ?? other?.username ?? "User",
        other_user: other ? { id: other.id, displayName: other.displayName, username: other.username, avatarUrl: other.avatarUrl } : null,
        created_at: c.createdAt.toISOString(),
        last_message_at: c.messages[0]?.createdAt ? c.messages[0].createdAt.toISOString() : null,
        last_message_preview: c.messages[0]?.body ?? null,
        unread_count: c._count?.messages ?? 0,
        pinned,
        other_user_id: other?.id ?? "",
      });
    }

    result.sort((a: any, b: any) => Number(b.pinned) - Number(a.pinned));

    return NextResponse.json({ data: { conversations: result } });
  } catch (error) {
    console.error("Failed to list conversations:", error);
    return NextResponse.json({ error: "Unable to load conversations." }, { status: 500 });
  }
}

async function getOtherUser(conversation: { participantAId: string; participantBId: string }, myId: string) {
  const otherId = conversation.participantAId === myId ? conversation.participantBId : conversation.participantAId;
  return await db.user.findUnique({
    where: { id: otherId },
    select: { id: true, displayName: true, username: true, avatarUrl: true },
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let parsed: { otherUserId?: string; itemId?: string } = {};
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const otherUserId = String(parsed.otherUserId ?? "").trim();
  const itemId = parsed.itemId ? String(parsed.itemId).trim() : null;
  if (!otherUserId || otherUserId === user.id) {
    return NextResponse.json({ error: "Choose a valid recipient." }, { status: 400 });
  }

  const [other, item] = await Promise.all([
    db.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, displayName: true, username: true, avatarUrl: true, allowMessages: true, allowMessageRequests: true },
    }),
    itemId ? db.item.findUnique({ where: { id: itemId }, select: { id: true, ownerId: true } }) : null,
  ]);

  if (!other) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (item && item.ownerId !== otherUserId) return NextResponse.json({ error: "Item does not belong to this user." }, { status: 403 });

  const [a, b] = [user.id, otherUserId].sort();

  let conversationId = "";
  await db.$transaction(async (tx) => {
    const blocked = await tx.block.findFirst({
      where: { OR: [{ blockerId: otherUserId, blockedId: user.id }, { blockerId: user.id, blockedId: otherUserId }] },
    });
    if (blocked) throw new Error("BLOCKED");
    if (!other.allowMessages) throw new Error("RECIPIENT_MESSAGES_DISABLED");
    if (other.allowMessageRequests === false) throw new Error("RECIPIENT_REQUESTS_DISABLED");

    const existing = itemId
      ? await tx.conversation.findUnique({
          where: { itemId_participantAId_participantBId: { itemId, participantAId: a, participantBId: b } },
          select: { id: true },
        })
      : await tx.conversation.findFirst({ where: { participantAId: a, participantBId: b }, select: { id: true } });
    if (existing) { conversationId = existing.id; return; }

    const conversation = await tx.conversation.create({
      data: { itemId: itemId || null, participantAId: a, participantBId: b },
    });
    conversationId = conversation.id;

    const initiatorName = user.displayName;
    await createNotification(otherUserId, {
      type: "message_request",
      title: "New message request",
      message: `${initiatorName} started a conversation with you.`,
      referenceId: conversationId,
      referenceType: "conversation",
    }).catch(() => {});

    await publishToParticipants(conversationId, [user.id, otherUserId], "conversation_new", {
      conversationId,
      otherUserId,
    });
  });

  return NextResponse.json({ data: { conversationId } });
}