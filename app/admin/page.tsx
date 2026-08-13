export const dynamic = "force-dynamic";
import { requireAdmin } from "@/lib/admin";
import { describeAdminAction } from "@/lib/admin";
import { db } from "@/lib/db";
import { AdminStatsCards } from "@/components/admin-stats-cards";

const ACTIVE = ["ACTIVE", "MATCHED", "CLAIM_PENDING"] as const;

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Moderation overview. Use the navigation above to manage users, posts, and reports.</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Statistics</h2>
      <div data-admin-stats>
        <AdminStatsCards initialStats={stats} />
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

