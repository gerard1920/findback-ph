export const dynamic = "force-dynamic";
import Link from "next/link";
import { ShieldCheck, BarChart3, History, Users } from "lucide-react";
import { ItemStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import { describeAdminAction } from "@/lib/admin";
import { db } from "@/lib/db";

const ACTIVE: ItemStatus[] = ["ACTIVE", "MATCHED", "CLAIM_PENDING"];

type Stats = {
  users: number;
  admins: number;
  bannedUsers: number;
  suspendedUsers: number;
  activeItems: number;
  lostActive: number;
  foundActive: number;
  pendingReports: number;
  totalReports: number;
};

async function loadStats(): Promise<Stats> {
  const [
    users,
    admins,
    bannedUsers,
    suspendedUsers,
    activeItems,
    lostActive,
    foundActive,
    pendingReports,
    totalReports,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({ where: { status: "BANNED" } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.item.count({ where: { status: { in: ACTIVE } } }),
    db.item.count({ where: { type: "LOST", status: { in: ACTIVE } } }),
    db.item.count({ where: { type: "FOUND", status: { in: ACTIVE } } }),
    db.report.count({ where: { status: "PENDING" } }),
    db.report.count(),
  ]);
  return { users, admins, bannedUsers, suspendedUsers, activeItems, lostActive, foundActive, pendingReports, totalReports };
}

async function loadLogs() {
  return db.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      reason: true,
      createdAt: true,
      admin: { select: { id: true, displayName: true, username: true } },
    },
  });
}

export default async function AdminHome() {
  await requireAdmin();

  const stats = await loadStats();
  const logs = await loadLogs();

  const statCards: Array<{ label: string; value: number; icon: React.ReactNode; href?: string; accent: string }> = [
    { label: "Total users", value: stats.users, icon: <Users size={16} />, href: "/admin/users", accent: "text-indigo-700 bg-indigo-50 ring-indigo-200" },
    { label: "Administrators", value: stats.admins, icon: <ShieldCheck size={16} />, href: "/admin/users", accent: "text-violet-700 bg-violet-50 ring-violet-200" },
    { label: "Banned users", value: stats.bannedUsers, icon: <BarChart3 size={16} />, href: "/admin/users?status=BANNED", accent: "text-rose-700 bg-rose-50 ring-rose-200" },
    { label: "Suspended users", value: stats.suspendedUsers, icon: <BarChart3 size={16} />, href: "/admin/users?status=SUSPENDED", accent: "text-amber-700 bg-amber-50 ring-amber-200" },
    { label: "Active posts", value: stats.activeItems, icon: <BarChart3 size={16} />, href: "/admin/posts", accent: "text-emerald-700 bg-emerald-50 ring-emerald-200" },
    { label: "Active lost", value: stats.lostActive, icon: <BarChart3 size={16} />, href: "/admin/posts?type=LOST", accent: "text-orange-700 bg-orange-50 ring-orange-200" },
    { label: "Active found", value: stats.foundActive, icon: <BarChart3 size={16} />, href: "/admin/posts?type=FOUND", accent: "text-sky-700 bg-sky-50 ring-sky-200" },
    { label: "Pending reports", value: stats.pendingReports, icon: <History size={16} />, href: "/admin/reports", accent: "text-amber-700 bg-amber-50 ring-amber-200" },
    { label: "Total reports", value: stats.totalReports, icon: <History size={16} />, href: "/admin/reports", accent: "text-slate-700 bg-slate-100 ring-slate-200" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Moderation overview. Use the navigation above to manage users, posts, and reports.</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Statistics</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((c) => (
          <Link
            key={c.label}
            href={c.href ?? "/admin"}
            className="card-hover flex items-center gap-4 p-5"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${c.accent}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-600">{c.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900">{c.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">Recent activity</h2>
      <p className="mt-1 text-sm text-slate-500">Latest administrator actions (last 20). A full ban history is available per user.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {logs.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No actions logged yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
                <th className="p-3">By</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="transition hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{l.createdAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-3 font-medium text-slate-900">{l.action}</td>
                  <td className="p-3 text-slate-600">{l.admin?.displayName ?? "System"}</td>
                  <td className="p-3 text-slate-600">{describeAdminAction(l.action, l.targetType, l.targetId, l.reason)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

