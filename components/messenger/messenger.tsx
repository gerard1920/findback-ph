/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Conversation, ConversationData, Message, Me, PresenceState } from "./types";
import {
  fetchMe, fetchConversations, fetchConversation, sendMessage, markRead,
  deleteMessage, react, unreact, createCall, updateCall,
} from "./api";
import { subscribeMessaging } from "./realtime";
import { ConversationList } from "./conversation-list";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./composer";
import { CallUI } from "./call-ui";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { Search, Plus, ArrowLeft, MessageSquare, Wifi, WifiOff } from "lucide-react";

const PRESENCE_INTERVAL = 25000;

function previewOf(p: any): string {
  if (p.type === "TEXT") return (p.body || "").slice(0, 160);
  if (p.type === "IMAGE") return "[image]";
  if (p.type === "VOICE") return "[voice message]";
  if (p.type === "FILE") return p.attachmentName ? `[${p.attachmentName}]` : "[file]";
  return "";
}

interface CallState { type: "AUDIO" | "VIDEO"; role: "INCOMING" | "OUTGOING" | "ACTIVE"; callId?: string }

export function Messenger({ initialConversationId }: { initialConversationId?: string }) {
  const { toast } = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(initialConversationId || null);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [convoError, setConvoError] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [connection, setConnection] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [typingBy, setTypingBy] = useState<string[]>([]);
  const [presence, setPresence] = useState<PresenceState>({ online: false, typing: false, lastSeen: null });
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [call, setCall] = useState<CallState | null>(null);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const typingTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const presenceTimer = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const callActiveRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingConvos(true);
    setConvoError(null);
    fetchMe()
      .then((m) => { if (!alive) return; setMe(m); })
      .catch(() => { if (!alive) return; setConvoError("Please log in to view messages."); })
      .finally(() => { if (!alive) return; setLoadingConvos(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!me) return;
    let alive = true;
    setLoadingConvos(true);
    fetchConversations(query || undefined)
      .then(({ conversations }) => { if (!alive) return; setConversations(conversations); })
      .catch(() => { if (!alive) return; })
      .finally(() => { if (!alive) return; setLoadingConvos(false); });
    return () => { alive = false; };
  }, [me?.id, query]);

  useEffect(() => {
    if (!active || !me) return;
    let alive = true;
    setLoadingChat(true);
    setMessages([]);
    setCursor(null);
    setHasMore(false);
    setConversation(null);
    fetchConversation(active)
      .then((page) => {
        if (!alive) return;
        setConversation(page.conversation);
        setMessages(page.messages);
        setHasMore(page.hasMore);
        setCursor(page.nextCursor);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 0);
      })
      .catch((err) => {
        if (!alive) return;
        console.error("Failed to load conversation:", err);
        toast({ title: "Couldn't open message", description: err?.message || "Unknown error", variant: "error" });
      })
      .finally(() => { if (!alive) return; setLoadingChat(false); });
    return () => { alive = false; };
  }, [active, me?.id]);

  useEffect(() => {
    if (!me) return;
    const cleanup = subscribeMessaging(me.id, active, {
      onMessageNew: (m: any) => {
        if (m.conversationId === active) {
          setMessages((ms) => {
            if (ms.some((x) => x.id === m.id)) return ms;
            return [...ms, m];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
        }
        setConversations((cs) => cs.map((c) => (c.id === m.conversationId ? { ...c, last_message_preview: (m.body || "").slice(0, 160), last_message_at: m.createdAt } : c)));
      },
      onMessageRead: (p: any) => {
        if (p.conversationId === active) {
          setMessages((ms) => ms.map((x) => (x.conversationId === p.conversationId && x.senderId !== me.id ? { ...x, readAt: p.at } : x)));
        }
      },
      onMessageDelivered: () => {},
      onMessageDeleted: (p: any) => {
        if (p.conversationId === active) {
          setMessages((ms) => ms.map((x) => (x.id === p.messageId ? { ...x, body: "", deletedAt: new Date().toISOString() } : x)));
        }
      },
      onMessageReacted: (p: any) => {
        if (p.conversationId === active) {
          setMessages((ms) => ms.map((x) => {
            if (x.id !== p.messageId) return x;
            const reactions = (x.reactions ?? []).filter((r) => !(r.userId === p.userId && r.emoji === p.emoji));
            if (p.added) reactions.push({ id: `${p.userId}-${p.emoji}`, userId: p.userId, emoji: p.emoji });
            return { ...x, reactions };
          }));
        }
      },
      onConversationUpdated: () => {
        fetchConversations(query || undefined).then(({ conversations }) => setConversations(conversations)).catch(() => {});
      },
      onTyping: (p: any) => {
        setTypingBy((arr) => {
          const next = arr.filter((u) => u !== p.userId);
          if (p.isTyping) next.push(p.userId);
          return next;
        });
      },
      onPresence: (p: any) => {
        setPresence({ online: p.online ?? false, typing: p.typing ?? false, lastSeen: p.lastSeen ?? null });
      },
      onCall: (p: any) => {
        if (p.conversationId !== active) return;
        if (p.status === "ringing" || p.status === "incoming") {
          setCall({ type: p.kind || "AUDIO", role: p.role || "INCOMING", callId: p.callId });
          callActiveRef.current = true;
        } else if (p.status === "accepted" && callActiveRef.current) {
          setCall((c) => c ? { ...c, role: "ACTIVE" } : null);
        } else if (p.status === "ended" || p.status === "rejected" || p.status === "failed" || p.status === "missed") {
          setCall(null);
          callActiveRef.current = false;
        }
      },
      setConnectionState: (s) => setConnection(s),
    });
    return cleanup;
  }, [me?.id, active, query]);

  useEffect(() => {
    if (!me?.id) return;
    announce(true);
    const onVisible = () => { if (!document.hidden) announce(true); };
    document.addEventListener("visibilitychange", onVisible);
    presenceTimer.current = setInterval(() => { if (!document.hidden) announce(true); }, PRESENCE_INTERVAL);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (presenceTimer.current) clearInterval(presenceTimer.current);
    };
  }, [me?.id]);

  function announce(online: boolean) {
    if (!me?.id) return;
    // Presence is managed server-side via the messaging API; this is a no-op placeholder.
  }

  useEffect(() => {
    const timers = typingTimers.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

  const sendText = useCallback(async (body: string) => {
    if (!active || !me || !body.trim()) return;
    setMessages((ms) => [
      ...ms,
      { id: `local-${Date.now()}`, conversationId: active, senderId: me.id, sender: { displayName: me.displayName, username: me.username, avatarUrl: me.avatarUrl }, type: "TEXT", body, attachmentUrl: null, attachmentName: null, attachmentSize: null, attachmentMime: null, durationSeconds: null, replyToId: replyTo?.id ?? null, replyTo: replyTo ? { id: replyTo.id, type: replyTo.type, body: replyTo.body, senderId: replyTo.senderId, senderName: replyTo.sender?.displayName ?? null } : null, reactions: [], status: "SENDING", deliveredAt: null, readAt: null, deletedAt: null, createdAt: new Date().toISOString() },
    ]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 0);
    try {
      const res = await sendMessage(active, { type: "TEXT", body, replyToId: replyTo?.id });
      setMessages((ms) => {
        const confirmed = { ...res.data, reactions: res.data.reactions ?? [] };
        const filtered = ms.filter((m) => !m.id.startsWith("local-"));
        return filtered.some((m) => m.id === confirmed.id) ? filtered : [...filtered, confirmed];
      });
      setConversations((cs) => cs.map((c) => (c.id === active ? { ...c, last_message_preview: body.slice(0, 160), last_message_at: new Date().toISOString() } : c)));
      setReplyTo(null);
    } catch (e: any) {
      toast({ title: "Message not sent", description: e?.message || "Send failed", variant: "error" });
    }
  }, [active, me, replyTo, toast]);

  const sendAttachment = useCallback(async (att: { url: string; name: string; size: number; mime: string; kind: string }, durationSeconds?: number) => {
    if (!active) return;
    const type = att.kind === "image" ? "IMAGE" : att.kind === "voice" ? "VOICE" : "FILE";
    const label = type === "IMAGE" ? "[image]" : type === "VOICE" ? "[voice message]" : att.name || "[file]";
    try {
      await sendMessage(active, { type, body: "", attachmentUrl: att.url, attachmentName: att.name, attachmentSize: att.size, attachmentMime: att.mime, durationSeconds: durationSeconds, replyToId: replyTo?.id });
      setReplyTo(null);
      setConversations((cs) => cs.map((c) => (c.id === active ? { ...c, last_message_preview: label, last_message_at: new Date().toISOString() } : c)));
    } catch (e: any) {
      toast({ title: "Attachment not sent", description: e?.message || "Send failed", variant: "error" });
    }
  }, [active, replyTo, toast]);

  const onDelete = useCallback(async (m: Message) => {
    if (!active) return;
    if (window.confirm("Delete this message for you?")) {
      try { await deleteMessage(active, m.id); } catch { toast({ title: "Could not delete", variant: "error" }); }
    }
  }, [active, toast]);

  const onReact = useCallback((m: Message, emoji: string) => {
    if (!active || !me) return;
    const has = (m.reactions ?? []).some((r) => r.userId === me.id && r.emoji === emoji);
    if (has) { unreact(active, m.id, emoji); setMessages((ms) => ms.map((x) => x.id === m.id ? { ...x, reactions: (x.reactions ?? []).filter((r) => !(r.userId === me.id && r.emoji === emoji)) } : x)); }
    else { react(active, m.id, emoji); setMessages((ms) => ms.map((x) => x.id === m.id ? { ...x, reactions: [...(x.reactions ?? []), { id: `${me.id}-${emoji}`, userId: me.id, emoji }] } : x)); }
  }, [active, me]);

  const onCall = useCallback(async (type: "AUDIO" | "VIDEO") => {
    if (!active || !me) return;
    try {
      const { callId } = await createCall(active, type);
      setCall({ type, role: "OUTGOING", callId });
      callActiveRef.current = true;
    } catch (e: any) {
      toast({ title: "Call failed", description: e?.message || "Could not start call.", variant: "error" });
    }
  }, [active, me, toast]);

  const endCall = useCallback(async () => {
    if (!call?.callId) return;
    try { await updateCall(call.callId, { status: "ended" }); } catch {}
    setCall(null);
    callActiveRef.current = false;
  }, [call?.callId]);

  const onBack = useCallback(() => {
    setActive(null);
    setConversation(null);
    setMessages([]);
    setReplyTo(null);
    setCall(null);
    callActiveRef.current = false;
  }, []);

  if (!me) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-ink-soft" />
          <p className="text-ink-soft">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`${active && isMobile ? "hidden" : "flex"} w-full flex-col border-r border-slate-200 bg-white/90 backdrop-blur-xl md:w-80 md:min-w-[320px]`}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
            <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-success-400/50" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft">Messages</h2>
          <div className="ml-auto flex items-center gap-1 text-xs text-ink-soft">
            {connection === "connected" ? <Wifi size={14} /> : <WifiOff size={14} />}
          </div>
        </div>
        <ConversationList
          conversations={conversations}
          active={active}
          onSelect={setActive}
          me={me}
          loading={loadingConvos}
          error={convoError}
        />
      </div>

      {active ? (
        <div className={`${active && isMobile ? "flex" : "hidden"} w-full flex-1 flex-col`}>
          <ChatHeader
            conversation={conversation}
            typingBy={typingBy}
            presence={presence}
            me={me}
            onCall={onCall}
            onPin={() => {}}
          />
          <div className="flex-1 overflow-y-auto bg-white/60">
            {loadingChat ? (
              <div className="flex h-full items-center justify-center text-ink-soft">Loading…</div>
            ) : (
              <MessageList
                messages={messages}
                meId={me.id}
                replyToMap={new Map()}
                onReply={setReplyTo}
                onReact={onReact}
                onDelete={onDelete}
                conversationId={active}
              />
            )}
            <div ref={bottomRef} />
          </div>
          <MessageComposer
            onSendText={sendText}
            onSendAttachment={sendAttachment}
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
          />
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center gap-4 md:flex">
          <MessageSquare className="h-16 w-16 text-ink-soft" />
          <p className="text-ink-soft">Select a conversation to start messaging.</p>
          <Link href="/messages" className="btn-primary">
            <Plus size={16} /> New message
          </Link>
        </div>
      )}

      {call && (
        <CallUI
          me={me}
          conversation={conversation}
          role={call.role}
          callId={call.callId}
          kind={call.type}
          onEnd={endCall}
        />
      )}
    </div>
  );
}
