export const dynamic = "force-dynamic";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ReportRow } from "@/components/admin-report-row";

const REASONS = ["ALL", "FAKE_LISTING", "SCAM", "HARASSMENT", "STOLEN", "INAPPROPRIATE", "SPAM", "SUSPICIOUS"];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = (sp?.status as string) || "ALL";
  const reason = (sp?.reason as string) || "ALL";

  const where: Prisma.ReportWhereInput = {};
  if (status !== "ALL") where.status = status;
  if (reason !== "ALL") where.reason = reason;

  const reports = await db.report.findMany({
    where,
    select: {
      id: true,
      status: true,
      reason: true,
      details: true,
      createdAt: true,
      resolvedAt: true,
      reporter: { select: { id: true, displayName: true, username: true, email: true } },
      reportedUser: { select: { id: true, displayName: true, username: true, email: true, status: true, role: true } },
      item: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          flagged: true,
          owner: { select: { id: true, displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Moderation queue for all reports (items and users). Review, dismiss, or take action.
      </p>

      <form className="mt-5 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status} className="mt-1">
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label className="label">Reason</label>
          <select name="reason" defaultValue={reason} className="mt-1">
            {REASONS.map((r) => (
              <option key={r} value={r}>{r === "ALL" ? "All reasons" : r}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Filter</button>
        <a href="/admin/reports" className="btn-secondary">Reset</a>
      </form>

      <div className="mt-5 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3">Reason</th>
              <th className="p-3">Details</th>
              <th className="p-3">Item</th>
              <th className="p-3">Reported user</th>
              <th className="p-3">Reporter</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((r) => (
              <ReportRow key={r.id} report={r} />
            ))}
          </tbody>
        </table>
      </div>
      {reports.length === 0 && <p className="mt-5 text-sm text-slate-500">No reports match your filters.</p>}
    </div>
  );
}

