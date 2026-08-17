/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notification-service";
import { publishToParticipants, serializeMessage } from "@/lib/messaging-realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 2000;
const VALID_TYPES = new Set(["TEXT", "IMAGE", "FILE", "VOICE", "CALL"]);
const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;

interface ConversationSession {
  id: string;
  participantAId: string;
  participantBId: string;
  itemId: string | null;
  pinnedByA: boolean;
  pinnedByB: boolean;
}

async function resolveConversation(id: string, user: { id: string }): Promise<{ conversation: ConversationSession; otherId: string } | null> {
  const conversation = await db.conversation.findUnique({
    where: { id },
    select: { id: true, participantAId: true, participantBId: true, itemId: true, pinnedByA: true, pinnedByB: true },
  });
  if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) return null;
  const otherId = conversation.participantAId === user.id ? conversation.participantBId : conversation.participantAId;
  return { conversation, otherId };
}

function isBlocked(tx: any, me: string, them: string): Promise<boolean> {
  return tx.block
    .findFirst({ where: { OR: [{ blockerId: them, blockedId: me }, { blockerId: me, blockedId: them }] } })
    .then((r: unknown) => Boolean(r));
}

function forMe(conversation: ConversationSession, userId: string): boolean {
  return conversation.participantAId === userId ? conversation.pinnedByA : conversation.pinnedByB;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const direction = String(url.searchParams.get("direction") || "backward");
    const limit = Math.min(60, Number(url.searchParams.get("limit") || 30));

    const session = await resolveConversation(id, user);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const { conversation, otherId } = session;

    const other = await db.user.findUnique({
      where: { id: otherId },
      select: { id: true, displayName: true, username: true, avatarUrl: true },
    });

    await db.$transaction(async (tx) => {
      await tx.message.updateMany({
        where: { conversationId: id, senderId: { not: user.id }, readAt: null },
        data: { readAt: new Date() },
      });
    });

    let where: any = { conversationId: id };
    if (direction === "backward" && cursor) {
      where = { conversationId: id, id: { lt: cursor } };
    }
    const messages = await db.message.findMany({
      where,
      orderBy: { createdAt: direction === "forward" ? "asc" : "desc", id: direction === "forward" ? "asc" : "desc" },
      take: limit,
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        body: true,
        type: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentSize: true,
        attachmentMime: true,
        durationSeconds: true,
        replyToId: true,
        status: true,
        deliveredAt: true,
        readAt: true,
        deletedAt: true,
        createdAt: true,
        sender: { select: { displayName: true, username: true, avatarUrl: true } },
        reactions: { select: { id: true, userId: true, emoji: true } },
      },
    });

    messages.reverse();

    let itemTitle: string | null = null;
    if (conversation.itemId) {
      try {
        const item = await db.item.findUnique({ where: { id: conversation.itemId }, select: { title: true } });
        itemTitle = item?.title ?? null;
      } catch {
        itemTitle = null;
      }
    }

    const serialized = messages.map((m) => {
      return serializeMessage({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        type: m.type,
        body: m.body,
        attachmentUrl: m.attachmentUrl,
        attachmentName: m.attachmentName,
        attachmentSize: m.attachmentSize,
        attachmentMime: m.attachmentMime,
        durationSeconds: m.durationSeconds,
        replyToId: m.replyToId,
        replyTo: null,
        reactions: m.reactions,
        status: m.status,
        deliveredAt: m.deliveredAt,
        readAt: m.readAt,
        deletedAt: m.deletedAt,
        createdAt: m.createdAt,
        sender: m.sender,
      });
    });

    return NextResponse.json({
      data: {
        conversation: {
          id: conversation.id,
          itemId: conversation.itemId,
          otherUser: other ? { id: other.id, displayName: other.displayName, username: other.username, avatarUrl: other.avatarUrl } : null,
          itemTitle,
          pinned: forMe(conversation, user.id),
        },
        messages: serialized,
        nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return NextResponse.json({ error: "Unable to load messages." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const session = await resolveConversation(id, user);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const { otherId } = session;
    let parsed: any = {};
    try {
      parsed = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const type = String(parsed.type || "TEXT").toUpperCase();
    if (!VALID_TYPES.has(type)) return NextResponse.json({ error: "Invalid message type." }, { status: 400 });

    if (type !== "TEXT") {
      return NextResponse.json({ error: "Rich message types require the pending messaging DB migration." }, { status: 503 });
    }

    const attachment =
      parsed.attachmentUrl && String(parsed.attachmentUrl) !== "null"
        ? { url: String(parsed.attachmentUrl), name: String(parsed.attachmentName || parsed.attachmentMime || "attachment"), size: Number(parsed.attachmentSize || 0), mime: String(parsed.attachmentMime || "") }
        : null;
    const text = String(parsed.body ?? "").trim();

    if (attachment) {
      if (!attachment.size || isNaN(attachment.size)) return NextResponse.json({ error: "Attachment size missing." }, { status: 400 });
      if (attachment.size > MAX_ATTACHMENT_SIZE) return NextResponse.json({ error: "Attachment too large." }, { status: 400 });
    } else if (type === "TEXT") {
      if (!text) return NextResponse.json({ error: "Message body is empty." }, { status: 400 });
      if (text.length > MAX_TEXT) return NextResponse.json({ error: `Message too long (max ${MAX_TEXT}).` }, { status: 400 });
    }

    const replyToId = parsed.replyToId ? String(parsed.replyToId) : null;

    const message = await db.$transaction(async (tx) => {
      const blocked = await isBlocked(tx, user.id, otherId);
      if (blocked) throw new Error("BLOCKED");
      const receiver = await tx.user.findUnique({ where: { id: otherId }, select: { allowMessages: true } });
      if (!receiver || !receiver.allowMessages) throw new Error("RECIPIENT_MESSAGES_DISABLED");

      const body = text;
      const msg = await tx.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          body,
          replyToId,
          readAt: null,
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          body: true,
          readAt: true,
          createdAt: true,
          sender: { select: { displayName: true, username: true, avatarUrl: true } },
        },
      });

      return msg;
    });

    const payload = serializeMessage({
      id: message.id, conversationId: message.conversationId, senderId: message.senderId, type: "TEXT", body: message.body,
      attachmentUrl: null, attachmentName: null, attachmentSize: null,
      attachmentMime: null, durationSeconds: null, replyToId, replyTo: null,
      reactions: [], status: "SENT", deliveredAt: null, readAt: message.readAt, deletedAt: null,
      createdAt: message.createdAt, sender: message.sender,
    });

    void createNotification(otherId, {
      type: "message",
      title: "New message",
      message: `${user.displayName} sent you a message.`,
      referenceId: id,
      referenceType: "conversation",
    }).catch(() => {});

    void publishToParticipants(id, [user.id, otherId], "message_new", payload);

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("Failed to send message:", error);
    if (error instanceof Error && error.message === "BLOCKED") return NextResponse.json({ error: "You cannot message this user." }, { status: 403 });
    if (error instanceof Error && error.message === "RECIPIENT_MESSAGES_DISABLED") {
      return NextResponse.json({ error: "This user has disabled new messages in their privacy settings." }, { status: 403 });
    }
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const session = await resolveConversation(id, user);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const { otherId } = session;
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || "read");
    const now = new Date().toISOString();

    if (action === "deliver") {
      return NextResponse.json({ ok: true, delivered: 0 });
    }

    if (action === "read") {
      const updated = await db.message.updateMany({
        where: { conversationId: id, senderId: { not: user.id }, readAt: null },
        data: { readAt: new Date() },
      });
      if (updated.count) {
        await publishToParticipants(id, [user.id, otherId], "message_read", { conversationId: id, readerId: user.id, count: updated.count, at: now });
      }
      return NextResponse.json({ ok: true, read: updated.count });
    }

    if (action === "pin") {
      return NextResponse.json({ ok: true, pinned: false, note: "Pinning is unavailable until the DB schema is migrated." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Failed to patch conversation:", error);
    return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id: conversationId } = await params;
    const session = await resolveConversation(conversationId, user);
    if (!session) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const { otherId } = session;

    const url = new URL(request.url);
    const messageId = url.searchParams.get("messageId");
    if (!messageId) return NextResponse.json({ error: "Missing messageId." }, { status: 400 });

    const message = await db.message.findUnique({ where: { id: messageId }, select: { id: true, conversationId: true, senderId: true } });
    if (!message || message.conversationId !== conversationId || message.senderId !== user.id) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    await db.message.update({ where: { id: messageId }, data: { body: "" } });
    await publishToParticipants(conversationId, [user.id, otherId], "message_deleted", { conversationId, messageId, deletedBy: user.id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ error: "Unable to delete message." }, { status: 500 });
  }
}