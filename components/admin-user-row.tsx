"use client";

import { AdminActionForm } from "@/components/admin-action-form";
import { AdminResetButton } from "@/components/admin-reset-button";
import { ConfirmButton } from "@/components/confirm-button";
import {
  adminSetUserRole,
  adminBanUser,
  adminSuspendUser,
  adminWarnUser,
  adminUnbanUser,
  adminDeleteUser,
} from "@/app/actions";
import { ShieldCheck, Ban, Clock } from "lucide-react";

type UserRowProps = {
  user: {
    id: string;
    email: string;
    displayName: string;
    username: string;
    role: "USER" | "ADMIN" | "SUSPENDED";
    status: "ACTIVE" | "SUSPENDED" | "BANNED";
    createdAt: Date;
    _count: { bans: number };
    bans: { action: string; reason: string; createdAt: Date }[];
  };
};

const BAN_PRESETS = ["Scam", "Policy violation", "Spam", "Fake listing", "Harassment", "Inappropriate content"];
const SUSPEND_PRESETS = ["Minor policy violation", "Temporary misconduct", "Excessive complaints", "Under review"];
const WARN_PRESETS = ["Repeated complaints", "Suspicious activity", "Borderline behavior", "Please read the rules"];

const statusColor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  SUSPENDED: "bg-amber-100 text-amber-800",
  BANNED: "bg-rose-100 text-rose-800",
};
const roleColor: Record<string, string> = {
  USER: "bg-slate-100 text-slate-700",
  ADMIN: "bg-amber-100 text-amber-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

export function UserRow({ user: u }: UserRowProps) {
  const isBanned = u.status === "BANNED";
  const isSuspended = u.status === "SUSPENDED";
  const activeBan = u.bans[0];
  return (
    <tr className={isBanned ? "bg-rose-50/40" : isSuspended ? "bg-amber-50/40" : ""}>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">
            {(u.displayName.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase()}
          </span>
          <div>
            <p className="font-semibold">{u.displayName}</p>
            <p className="text-xs text-slate-500">@{u.username}</p>
          </div>
        </div>
      </td>
      <td className="p-3 text-slate-600">{u.email}</td>
      <td className="p-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColor[u.role]}`}>
          {u.role === "ADMIN" && <ShieldCheck size={12} />}
          {u.role === "ADMIN" ? "Admin" : "Member"}
        </span>
      </td>
      <td className="p-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[u.status] ?? statusColor.ACTIVE}`}>
          {u.status}
        </span>
      </td>
      <td className="p-3 text-slate-600">
        {activeBan ? (
          <span className="inline-flex items-center gap-1 text-xs">
            <Ban size={12} />
            <span className="font-medium">{activeBan.action}:</span> {activeBan.reason}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}</td>
      <td className="p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {!isBanned && (
            <AdminActionForm
              action={adminBanUser.bind(null, u.id)}
              label="Ban"
              variant="danger"
              icon={<Ban size={13} />}
              presets={BAN_PRESETS}
              defaultReason={BAN_PRESETS[0]}
            />
          )}
          {!isBanned && !isSuspended && (
            <AdminActionForm
              action={adminSuspendUser.bind(null, u.id)}
              label="Suspend"
              variant="warn"
              icon={<Clock size={13} />}
              presets={SUSPEND_PRESETS}
              defaultReason={SUSPEND_PRESETS[0]}
            />
          )}
          <AdminActionForm
            action={adminWarnUser.bind(null, u.id)}
            label="Warn"
            variant="secondary"
            presets={WARN_PRESETS}
            defaultReason={WARN_PRESETS[0]}
          />
          {(isBanned || isSuspended) && (
            <AdminActionForm
              action={adminUnbanUser.bind(null, u.id)}
              label="Restore"
              variant="default"
              icon={<ShieldCheck size={13} />}
              presets={["Verified safe", "False report", "Appeal accepted"]}
              defaultReason="Account restored"
            />
          )}
          {u.role === "USER" && (
            <form action={adminSetUserRole.bind(null, u.id, "ADMIN")}>
              <button type="submit" className="btn-secondary" title="Make admin">Make admin</button>
            </form>
          )}
          {u.role === "ADMIN" && (
            <form action={adminSetUserRole.bind(null, u.id, "USER")}>
              <button type="submit" className="btn-secondary" title="Revoke admin">Revoke admin</button>
            </form>
          )}
          <AdminResetButton userId={u.id} username={u.username} />
          <ConfirmButton action={adminDeleteUser.bind(null, u.id)} label={u.displayName} className="btn bg-rose-700 text-white hover:bg-rose-800" />
        </div>
      </td>
    </tr>
  );
}
