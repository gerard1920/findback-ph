import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function userChannel(userId: string): string {
  return `user:${userId}`;
}

export function conversationChannel(conversationId: string): string {
  return `conversation:${conversationId}`;
}

async function publish(channel: string, event: string, payload: Record<string, unknown>): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  try {
    const c: RealtimeChannel = supabase.channel(channel, { config: { broadcast: { self: true } } });
    await c.subscribe();
    const status = await c.send({ type: "broadcast", event, payload });
    const ok = status === "ok";
    if (c) c.unsubscribe();
    if (!ok) console.error(`[realtime] publish to ${channel} event=${event} status=${status}`);
    return ok;
  } catch (err) {
    console.error(`[realtime] publish error on ${channel} event=${event}`, err);
    return false;
  }
}

export async function publishToUser(userId: string, event: string, payload: Record<string, unknown>): Promise<boolean> {
  return publish(userChannel(userId), event, payload);
}

export async function publishToConversation(conversationId: string, event: string, payload: Record<string, unknown>): Promise<boolean> {
  return publish(conversationChannel(conversationId), event, payload);
}

export async function publishToParticipants(conversationId: string, participantIds: string[], event: string, payload: Record<string, unknown>): Promise<void> {
  await Promise.all([
    publishToConversation(conversationId, event, payload),
    ...participantIds.map((uid) => publishToUser(uid, event, payload)),
  ]);
}

export function serializeMessage(m: {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  attachmentMime: string | null;
  durationSeconds: number | null;
  replyToId: string | null;
  replyTo?: { id: string; type: string; body: string; senderName?: string | null; senderId?: string } | null;
  reactions?: { id: string; userId: string; emoji: string }[];
  status: string;
  deliveredAt: Date | null;
  readAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  sender?: { displayName: string; username: string; avatarUrl: string | null } | null;
}): Record<string, unknown> {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    sender: m.sender ? { displayName: m.sender.displayName, username: m.sender.username, avatarUrl: m.sender.avatarUrl } : null,
    type: m.type,
    body: m.body,
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
    attachmentSize: m.attachmentSize,
    attachmentMime: m.attachmentMime,
    durationSeconds: m.durationSeconds,
    replyToId: m.replyToId,
    replyTo: m.replyTo
      ? { id: m.replyTo.id, type: m.replyTo.type, body: m.replyTo.body, senderName: m.replyTo.senderName ?? null, senderId: m.replyTo.senderId ?? null }
      : null,
    reactions: (m.reactions ?? []).map((r) => ({ id: r.id, userId: r.userId, emoji: r.emoji })),
    status: m.status,
    deliveredAt: m.deliveredAt ? m.deliveredAt.toISOString() : null,
    readAt: m.readAt ? m.readAt.toISOString() : null,
    deletedAt: m.deletedAt ? m.deletedAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  };
}