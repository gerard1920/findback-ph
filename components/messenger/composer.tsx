/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { VoiceRecorder } from "./voice-recorder";
import type { Message } from "./types";

export function MessageComposer({
  onSendText,
  onSendAttachment,
  replyTo,
  onClearReply,
}: {
  onSendText: (text: string) => void;
  onSendAttachment: (att: { url: string; name: string; size: number; mime: string; kind: string }, durationSeconds?: number) => void;
  replyTo: Message | null;
  onClearReply: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSendText(trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-ink-soft">
          <span>Replying to: {replyTo.body?.slice(0, 120)}</span>
          <button onClick={onClearReply} className="ml-2 text-ink-soft hover:text-ink">Cancel</button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <label className="flex cursor-pointer items-center rounded-full p-2 text-ink-soft hover:bg-primary/5 hover:text-primary">
          <Paperclip size={18} />
          <input type="file" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "voice" : "file";
            onSendAttachment({ url, name: file.name, size: file.size, mime: file.type, kind });
            e.target.value = "";
          }} />
        </label>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
