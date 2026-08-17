/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function getSupabase() {
  return supabase;
}

export function subscribeMessaging(
  userId: string,
  _conversationId: string | null,
  handlers: {
    onMessageNew: (m: any) => void;
    onMessageRead: (p: any) => void;
    onMessageDelivered: (p: any) => void;
    onMessageDeleted: (p: any) => void;
    onMessageReacted: (p: any) => void;
    onConversationUpdated: (p: any) => void;
    onTyping: (p: any) => void;
    onPresence: (p: any) => void;
    onCall: (p: any) => void;
    setConnectionState: (s: "connected" | "connecting" | "disconnected") => void;
  },
): () => void {
  const channels: RealtimeChannel[] = [];

  const userChannel = supabase
    .channel(`user:${userId}`)
    .on("broadcast", { event: "message_new" }, (payload) => handlers.onMessageNew(payload.payload))
    .on("broadcast", { event: "message_delivered" }, (payload) => handlers.onMessageDelivered(payload.payload))
    .on("broadcast", { event: "message_read" }, (payload) => handlers.onMessageRead(payload.payload))
    .on("broadcast", { event: "message_deleted" }, (payload) => handlers.onMessageDeleted(payload.payload))
    .on("broadcast", { event: "message_reacted" }, (payload) => handlers.onMessageReacted(payload.payload))
    .on("broadcast", { event: "typing" }, (payload) => handlers.onTyping(payload.payload))
    .on("broadcast", { event: "presence" }, (payload) => handlers.onPresence(payload.payload))
    .on("broadcast", { event: "call_incoming" }, (payload) => handlers.onCall(payload.payload))
    .on("broadcast", { event: "call_accepted" }, (payload) => handlers.onCall(payload.payload))
    .on("broadcast", { event: "call_rejected" }, (payload) => handlers.onCall(payload.payload))
    .on("broadcast", { event: "call_ended" }, (payload) => handlers.onCall(payload.payload))
    .on("broadcast", { event: "call_failed" }, (payload) => handlers.onCall(payload.payload))
    .on("broadcast", { event: "call_missed" }, (p: any) => handlers.onCall(p.payload))
    .on("broadcast", { event: "conversation_new" }, (payload) => handlers.onConversationUpdated(payload.payload))
    .on("broadcast", { event: "conversation_updated" }, (payload) => handlers.onConversationUpdated(payload.payload))
    .subscribe((status) => {
      const s = String(status);
      handlers.setConnectionState(s === "SUBSCRIBED" ? "connected" : s === "SUBSCRIBING" ? "connecting" : "disconnected");
    });

  channels.push(userChannel);

  return () => {
    channels.forEach((ch) => {
      try { ch.unsubscribe(); } catch {}
    });
  };
}
