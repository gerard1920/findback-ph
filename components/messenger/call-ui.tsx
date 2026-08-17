/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Phone, Video, PhoneOff } from "lucide-react";

export function CallUI({
  me,
  conversation,
  role,
  callId,
  kind,
  onEnd,
}: {
  me: any;
  conversation: any;
  role: "INCOMING" | "OUTGOING" | "ACTIVE";
  callId?: string;
  kind: "AUDIO" | "VIDEO";
  onEnd: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {kind === "VIDEO" ? <Video size={28} /> : <Phone size={28} />}
        </div>
        <h3 className="font-display text-lg font-bold text-ink">{conversation?.otherUser?.displayName || "Call"}</h3>
        <p className="mt-1 text-sm text-ink-soft">{role === "INCOMING" ? "Incoming call…" : role === "OUTGOING" ? "Calling…" : "Call active"}</p>
        <button onClick={onEnd} className="mt-6 inline-flex items-center gap-2 rounded-full bg-danger-600 px-5 py-2 text-sm font-semibold text-white">
          <PhoneOff size={16} /> End call
        </button>
      </div>
    </div>
  );
}
