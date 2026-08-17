"use client";
import { Phone, Video, Search, Pin, PinOff, MoreVertical } from "lucide-react";
import type { ConversationData, PresenceState } from "./types";

export function ChatHeader({
  conversation,
  typingBy,
  presence,
  onCall,
  onPin,
}: {
  conversation: ConversationData | null;
  typingBy: string[];
  presence: PresenceState | undefined;
  me: { id: string } | null;
  onCall: (type: "AUDIO" | "VIDEO") => void;
  onPin: () => void;
}) {
  if (!conversation?.otherUser) {
    return (
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {conversation.otherUser.displayName?.charAt(0).toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{conversation.otherUser.displayName}</p>
        <p className="text-xs text-ink-soft">
          {typingBy.length ? "typing…" : presence?.online ? "online" : presence?.lastSeen ? `last seen ${new Date(presence.lastSeen).toLocaleString()}` : "offline"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onCall("AUDIO")} className="rounded-full p-2 text-ink-soft hover:bg-primary/5 hover:text-primary" title="Audio call">
          <Phone size={18} />
        </button>
        <button onClick={() => onCall("VIDEO")} className="rounded-full p-2 text-ink-soft hover:bg-primary/5 hover:text-primary" title="Video call">
          <Video size={18} />
        </button>
        <button onClick={onPin} className="rounded-full p-2 text-ink-soft hover:bg-primary/5 hover:text-primary" title="Pin conversation">
          {conversation.pinned ? <PinOff size={18} /> : <Pin size={18} />}
        </button>
      </div>
    </div>
  );
}
