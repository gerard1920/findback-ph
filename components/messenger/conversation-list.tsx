"use client";
import type { Conversation } from "./types";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function ConversationList({
  conversations,
  active,
  onSelect,
  me,
  loading,
  error,
  onRetry,
}: {
  conversations: Conversation[];
  active: string | null;
  onSelect: (id: string) => void;
  me: { id: string; displayName: string; avatarUrl?: string | null } | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-ink-soft">Loading conversations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <p className="text-sm text-danger-600">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary">Retry</button>
        )}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <MessageSquare className="h-10 w-10 text-ink-soft" />
        <p className="text-sm text-ink-soft">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            "flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-primary/5",
            active === c.id && "bg-primary/5"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {(c.other_user?.displayName || c.other_user?.username || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-ink">{c.title}</p>
              {c.last_message_at && (
                <span className="shrink-0 text-xs text-ink-soft">{timeAgo(c.last_message_at)}</span>
              )}
            </div>
            <p className="truncate text-xs text-ink-soft">{c.last_message_preview || "No messages yet"}</p>
          </div>
          {c.unread_count > 0 && (
            <span className="ml-auto shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
              {c.unread_count > 99 ? "99+" : c.unread_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
