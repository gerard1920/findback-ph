/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type { Message } from "./types";

export function MessageList({
  messages,
  meId,
  onReply,
  onReact,
  onDelete,
  conversationId,
}: {
  messages: Message[];
  meId: string;
  replyToMap: Map<string, Message>;
  onReply: (m: Message) => void;
  onReact: (m: Message, emoji: string) => void;
  onDelete: (m: Message) => void;
  conversationId: string;
}) {
  return (
    <div className="space-y-4 p-4">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.senderId === meId ? "justify-end" : "justify-start"}`}>
          <div className="max-w-[75%] rounded-2xl bg-white/80 px-4 py-2 shadow-sm">
            <p className="text-sm text-ink">{m.body || `[${m.type}]`}</p>
            <p className="mt-1 text-xs text-ink-soft">{new Date(m.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
