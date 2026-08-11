"use client";

import { AdminActionForm } from "@/components/admin-action-form";
import {
  adminReviewReport,
  adminResolveReport,
  adminRejectReport,
  adminRemovePostFromReport,
  adminBanReportedUser,
} from "@/app/actions";
import { CheckSquare, XSquare, Trash2, Ban } from "lucide-react";

export type ReportRowProps = {
  report: {
    id: string;
    status: string;
    reason: string;
    details: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
    reporter: { id: string; displayName: string; username: string; email: string } | null;
    reportedUser: { id: string; displayName: string; username: string; email: string; status: string; role: string } | null;
    item: { id: string; title: string; type: string; status: string; flagged: boolean; owner: { id: string; displayName: string } | null } | null;
  };
};

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  REVIEWING: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-slate-100 text-slate-600",
};

const reasonPresets: Record<string, string[]> = {
  SCAM: ["Scam attempt", "Fake payment request"],
  FAKE_LISTING: ["Listed non-existent item", "Duplicate listing"],
  HARASSMENT: ["Threats / abuse", "Offensive messages"],
  SPAM: ["Spam / junk", "Excessive posting"],
  INAPPROPRIATE: ["Inappropriate content", "Nudity / profanity"],
  STOLEN: ["Reported as stolen property"],
  SUSPICIOUS: ["Suspicious activity"],
};

export function ReportRow({ report: r }: ReportRowProps) {
  const reported = r.reportedUser;
  const item = r.item;
  const canTakeAction = r.status !== "RESOLVED" && r.status !== "REJECTED";
  const presets = reasonPresets[r.reason] ?? ["Moderation required"];
  return (
            <tr className={item?.flagged ? "bg-amber-50/40" : ""}>
      <td className="p-3">
        <p className="font-semibold">{r.reason}</p>
        <p className="text-xs text-slate-500">Reported {r.createdAt.toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" })}</p>
      </td>
      <td className="p-3 text-slate-600 max-w-xs">
        {r.details ? <p className="line-clamp-2 text-sm">{r.details}</p> : <span className="text-slate-400">—</span>}
      </td>
      <td className="p-3">
        {item ? (
          <span className="inline-flex flex-col gap-0.5 text-xs">
            <span>Post: {item.title}</span>
            <span className="text-slate-500">Type: {item.type} • {item.status}</span>
            {item.owner && <span className="text-slate-500">Owner: {item.owner.displayName}</span>}
          </span>
        ) : (
          <span className="text-slate-400">User-only report</span>
        )}
      </td>
      <td className="p-3">
        {reported ? (
          <span className="inline-flex flex-col gap-0.5 text-xs">
            <span className="font-medium">{reported.displayName}</span>
                        <span className="text-slate-500">@{reported.username}</span>
            <span className="text-slate-500">{reported.email}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="p-3 text-slate-600">{r.reporter?.displayName ?? "—"}</td>
      <td className="p-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? "bg-slate-100 text-slate-600"}`}>{r.status}</span>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {r.status === "PENDING" && (
            <form action={adminReviewReport.bind(null, r.id)}>
              <button type="submit" className="btn-secondary" title="Review">Review</button>
            </form>
          )}
          {canTakeAction && (
            <AdminActionForm
              action={adminBanReportedUser.bind(null, r.id)}
              label="Ban user"
              variant="danger"
              icon={<Ban size={13} />}
              presets={presets}
              defaultReason={presets[0]}
              confirmLabel="Ban"
            />
          )}
          {item && r.status !== "RESOLVED" && r.status !== "REJECTED" && (
            <AdminActionForm
              action={adminRemovePostFromReport.bind(null, r.id)}
              label="Remove post"
              variant="warn"
              icon={<Trash2 size={13} />}
              presets={["Policy violation", "Resolved offline", "Duplicate"]}
              defaultReason="Post removed by moderator"
            />
          )}
          {canTakeAction && (
            <AdminActionForm
              action={adminRejectReport.bind(null, r.id)}
              label="Dismiss"
              variant="secondary"
              icon={<XSquare size={13} />}
              presets={["False report", "No violation found", "Resolved elsewhere"]}
              defaultReason="No violation found"
              confirmLabel="Dismiss"
            />
          )}
          {r.status === "REVIEWING" && (
            <AdminActionForm
              action={adminResolveReport.bind(null, r.id)}
              label="Resolve"
              variant="default"
              icon={<CheckSquare size={13} />}
              presets={presets}
              defaultReason={presets[0] ?? "Resolved"}
            />
          )}
        </div>
      </td>
    </tr>
  );
}
