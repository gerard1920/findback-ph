/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ConversationPage, Conversation, Me, Message } from "./types";

export async function api<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchMe(): Promise<Me> {
  return api<Me>("/api/session");
}

export async function fetchConversations(q?: string): Promise<{ conversations: Conversation[] }> {
  const url = q ? `/api/messages?q=${encodeURIComponent(q)}` : "/api/messages";
  return api<{ conversations: Conversation[] }>(url);
}

export async function fetchConversation(id: string): Promise<ConversationPage> {
  return api<ConversationPage>(`/api/messages/${encodeURIComponent(id)}`);
}

export async function sendMessage(conversationId: string, data: { type?: string; body: string; attachmentUrl?: string; attachmentName?: string; attachmentSize?: number; attachmentMime?: string; durationSeconds?: number; replyToId?: string }) {
  return api<{ data: Message }>(`/api/messages/${encodeURIComponent(conversationId)}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markRead(conversationId: string) {
  return api<{ ok: boolean; read: number }>(`/api/messages/${encodeURIComponent(conversationId)}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "read" }),
  });
}

export async function deleteMessage(conversationId: string, messageId: string) {
  const url = new URL(`/api/messages/${encodeURIComponent(conversationId)}`, window.location.origin);
  url.searchParams.set("messageId", messageId);
  return api<{ ok: boolean }>(url.toString(), { method: "DELETE" });
}

export async function react(conversationId: string, messageId: string, emoji: string) {
  return api<{ ok: boolean }>(`/api/messages/${encodeURIComponent(conversationId)}/reactions`, {
    method: "POST",
    body: JSON.stringify({ messageId, emoji }),
  });
}

export async function unreact(conversationId: string, messageId: string, emoji: string) {
  const url = new URL(`/api/messages/${encodeURIComponent(conversationId)}/reactions`, window.location.origin);
  url.searchParams.set("messageId", messageId);
  url.searchParams.set("emoji", emoji);
  return api<{ ok: boolean }>(url.toString(), { method: "DELETE" });
}

export async function createCall(conversationId: string, kind: "AUDIO" | "VIDEO") {
  return api<{ callId: string }>(`/api/messages/${encodeURIComponent(conversationId)}/calls`, {
    method: "POST",
    body: JSON.stringify({ kind }),
  });
}

export async function updateCall(callId: string, data: Record<string, any>) {
  return api<{ ok: boolean }>(`/api/messages/[id]/call/${encodeURIComponent(callId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
