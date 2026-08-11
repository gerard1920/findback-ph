"use client";

import { reportUser } from "@/app/actions";
import { Flag } from "lucide-react";

const REASONS = [
  { value: "SCAM", label: "Scam or fraud" },
  { value: "HARASSMENT", label: "Harassment or abuse" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "STOLEN", label: "Listed stolen property" },
  { value: "FAKE_LISTING", label: "Fake listing" },
  { value: "SUSPICIOUS", label: "Suspicious behavior" },
];

export function ReportUserForm({ targetUserId }: { targetUserId: string }) {
  return (
    <form action={reportUser.bind(null, targetUserId)} className="card mt-6 p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Flag size={16} />
        Report this user
      </h2>
      <p className="mt-1 text-sm text-slate-600">Misusing FindBack PH? Let us know and we’ll review it.</p>
      <label className="mt-3 block">
        <span className="label">Reason</span>
        <select name="reason" required className="mt-1">
          <option value="" disabled>
            Choose a reason
          </option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="label">Details (optional)</span>
        <textarea name="details" rows={3} placeholder="Add any extra context…" className="mt-1" />
      </label>
      <button type="submit" className="mt-4 btn-primary">
        Submit report
      </button>
    </form>
  );
}
