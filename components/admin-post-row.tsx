"use client";

import { AdminActionForm } from "@/components/admin-action-form";
import { ConfirmButton } from "@/components/confirm-button";
import {
  adminHideItem,
  adminRestoreItem,
  adminResolveItem,
  adminFlagItem,
  adminUnflagItem,
  adminDeleteItem,
} from "@/app/actions";
import { Flag, Eye, EyeOff, CheckSquare } from "lucide-react";

type PostRowProps = {
  post: {
    id: string;
    title: string;
    type: "LOST" | "FOUND";
    status: string;
    flagged: boolean;
    city: string | null;
    province: string | null;
    createdAt: Date;
    owner: { id: string; displayName: string; username: string } | null;
    category: { name: string } | null;
    images: { url: string; alt: string | null }[];
    _count: { reports: number; claims: number };
  };
};

const statusColor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  MATCHED: "bg-blue-100 text-blue-800",
  CLAIM_PENDING: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-slate-100 text-slate-700",
  EXPIRED: "bg-slate-100 text-slate-500",
  REMOVED: "bg-rose-100 text-rose-800",
};

export function PostRow({ post: i }: PostRowProps) {
  const visible = i.status === "ACTIVE" || i.status === "MATCHED" || i.status === "CLAIM_PENDING";
  const img = i.images[0]?.url;
  return (
    <tr className={i.flagged ? "bg-amber-50/40" : ""}>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <img src={img || "/placeholder.png"} alt={i.images[0]?.alt ?? i.title} className="h-12 w-12 rounded-lg border object-cover" />
          <div>
            <p className="font-semibold line-clamp-1">{i.title}</p>
            <p className="text-xs text-slate-500">{i.category?.name ?? "—"} • {i.province ?? "—"}, {i.city ?? ""}</p>
          </div>
        </div>
      </td>
      <td className="p-3">
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
          {i.type === "LOST" ? "Lost" : "Found"}
        </span>
      </td>
      <td className="p-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[i.status] ?? statusColor.ACTIVE}`}>{i.status}</span>
      </td>
      <td className="p-3 text-center">{i.flagged && <Flag size={14} className="mx-auto text-amber-500" />}</td>
      <td className="p-3 text-slate-600">{i._count.reports} reports · {i._count.claims} claims</td>
      <td className="p-3 text-slate-600">{i.owner?.displayName ?? "—"}</td>
      <td className="p-3 text-slate-500">{new Date(i.createdAt).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}</td>
      <td className="p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {visible && (
            <AdminActionForm
              action={adminHideItem.bind(null, i.id)}
              label="Hide"
              variant="warn"
              icon={<EyeOff size={13} />}
              presets={["Policy violation", "Resolved offline", "Duplicate"]}
              defaultReason="Removed by moderator"
            />
          )}
          {i.status === "REMOVED" && (
            <AdminActionForm action={adminRestoreItem.bind(null, i.id)} label="Restore" variant="default" icon={<Eye size={13} />} />
          )}
          {visible && !i.flagged && (
            <AdminActionForm action={adminFlagItem.bind(null, i.id)} label="Flag" variant="warn" icon={<Flag size={13} />} immediate />
          )}
          {i.flagged && (
            <AdminActionForm action={adminUnflagItem.bind(null, i.id)} label="Unflag" variant="default" icon={<Flag size={13} />} immediate />
          )}
          {visible && (
            <AdminActionForm
              action={adminResolveItem.bind(null, i.id)}
              label="Resolve"
              variant="default"
              icon={<CheckSquare size={13} />}
              presets={["Handed over", "Owner located", "Closed"]}
              defaultReason="Marked resolved by moderator"
            />
          )}
          <ConfirmButton action={adminDeleteItem.bind(null, i.id)} label={i.title} className="btn bg-rose-700 text-white hover:bg-rose-800" />
        </div>
      </td>
    </tr>
  );
}

