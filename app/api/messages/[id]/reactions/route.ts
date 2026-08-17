import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { publishToParticipants } from "@/lib/messaging-realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function otherUser(participantAId: string, participantBId: string, me: string) {
  return participantAId === me ? participantBId : participantAId;
}

function isMessagingMigrationError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("does not exist") || msg.includes("Invalid `prisma.messageReaction");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const convo = await db.conversation.findUnique({ where: { id }, select: { participantAId: true, participantBId: true } });
    if (!convo || (convo.participantAId !== user.id && convo.participantBId !== user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const otherId = otherUser(convo.participantAId, convo.participantBId, user.id);
    const body = await request.json().catch(() => ({}));
    const messageId = String(body?.messageId || "").trim();
    const emoji = String(body?.emoji || "").trim();
    if (!messageId || !emoji) return NextResponse.json({ error: "messageId and emoji are required." }, { status: 400 });

    const message = await db.message.findUnique({ where: { id: messageId }, select: { id: true, conversationId: true, senderId: true } });
    if (!message || message.conversationId !== id) return NextResponse.json({ error: "Message not found." }, { status: 404 });

    const existing = await db.messageReaction.findFirst({
      where: { messageId, userId: user.id, emoji },
    });

    if (existing) {
      await db.messageReaction.update({
        where: { id: existing.id },
        data: { createdAt: new Date() },
      });
    } else {
      await db.messageReaction.create({
        data: { messageId, userId: user.id, emoji },
      });
    }

    await publishToParticipants(id, [user.id, otherId], "message_reacted", { conversationId: id, messageId, emoji, userId: user.id, added: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMessagingMigrationError(error)) {
      return NextResponse.json({ error: "Reactions are unavailable until the messaging migration is applied." }, { status: 503 });
    }
    console.error("Failed to add reaction:", error);
    return NextResponse.json({ error: "Unable to add reaction." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const convo = await db.conversation.findUnique({ where: { id }, select: { participantAId: true, participantBId: true } });
    if (!convo || (convo.participantAId !== user.id && convo.participantBId !== user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const otherId = otherUser(convo.participantAId, convo.participantBId, user.id);
    const url = new URL(request.url);
    const messageId = String(url.searchParams.get("messageId") || "").trim();
    const emoji = String(url.searchParams.get("emoji") || "").trim();
    if (!messageId || !emoji) return NextResponse.json({ error: "messageId and emoji are required." }, { status: 400 });

    await db.messageReaction.deleteMany({ where: { messageId, userId: user.id, emoji } });
    await publishToParticipants(id, [user.id, otherId], "message_reacted", { conversationId: id, messageId, emoji, userId: user.id, added: false });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMessagingMigrationError(error)) {
      return NextResponse.json({ error: "Reactions are unavailable until the messaging migration is applied." }, { status: 503 });
    }
    console.error("Failed to remove reaction:", error);
    return NextResponse.json({ error: "Unable to remove reaction." }, { status: 500 });
  }
}