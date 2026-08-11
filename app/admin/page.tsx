export const dynamic = "force-dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, BarChart3, History } from "lucide-react";
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

  const statCards: Array<{ label: string; value: number; icon: React.ReactNode; href?: string }> = [
    { label: "Total users", value: stats.users, icon: <ShieldCheck size={16} /> },
    { label: "Administrators", value: stats.admins, icon: <ShieldCheck size={16} />, href: "/admin/users" },
    { label: "Banned users", value: stats.bannedUsers, icon: <BarChart3 size={16} />, href: "/admin/users?status=BANNED" },
    { label: "Suspended users", value: stats.suspendedUsers, icon: <BarChart3 size={16} />, href: "/admin/users?status=SUSPENDED" },
    { label: "Active posts", value: stats.activeItems, icon: <BarChart3 size={16} />, href: "/admin/posts" },
    { label: "Active lost", value: stats.lostActive, icon: <BarChart3 size={16} />, href: "/admin/posts?type=LOST" },
    { label: "Active found", value: stats.foundActive, icon: <BarChart3 size={16} />, href: "/admin/posts?type=FOUND" },
    { label: "Pending reports", value: stats.pendingReports, icon: <History size={16} />, href: "/admin/reports" },
    { label: "Total reports", value: stats.totalReports, icon: <History size={16} />, href: "/admin/reports" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Moderation overview. Use the navigation above to manage users, posts, and reports.</p>

      <h2 className="mt-8 text-xl font-bold">Statistics</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((c) => (
          <Link key={c.label} href={c.href ?? "/admin"} className="card p-5 hover:bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500">{c.icon}<span className="text-sm">{c.label}</span></div>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Recent activity</h2>
      <p className="mt-1 text-sm text-slate-500">Latest administrator actions (last 20). A full ban history is available per user.</p>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        {logs.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No actions logged yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Action</th>
                <th className="p-2">By</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="p-2 text-slate-500">{l.createdAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-2 font-medium">{l.action}</td>
                  <td className="p-2 text-slate-600">{l.admin?.displayName ?? "System"}</td>
                  <td className="p-2 text-slate-600">{describeAdminAction(l.action, l.targetType, l.targetId, l.reason)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

