import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ItemStatus } from "@prisma/client";
import { ConfirmButton } from "@/components/confirm-button";
import { ShieldCheck } from "lucide-react";
import { setRole, deleteUser } from "@/app/actions";
import { AdminResetButton } from "@/components/admin-reset-button";

const active: ItemStatus[] = ["ACTIVE", "MATCHED", "CLAIM_PENDING"];
const roleLabel: Record<string, string> = { USER: "Member", ADMIN: "Admin", SUSPENDED: "Held" };

export default async function Admin() {
  const me = await requireUser();
  if (me.role !== "ADMIN") redirect("/dashboard");

  const [userCount, lost, found, reports, users, counts] = await Promise.all([
    db.user.count(),
    db.item.count({ where: { type: "LOST", status: { in: active } } }),
    db.item.count({ where: { type: "FOUND", status: { in: active } } }),
    db.report.count({ where: { status: "PENDING" } }),
    db.user.findMany({
      select: { id: true, email: true, displayName: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.item.groupBy({ by: ["ownerId"], where: { status: { in: active } }, _count: true }),
  ]);
    const reportCount: Record<string, number> = Object.fromEntries(counts.map((c) => [c.ownerId, Number(c._count ?? 0)]));

  return (
    <main className="container-page py-10">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Total users", userCount],
          ["Active lost reports", lost],
          ["Active found reports", found],
          ["Pending reports", reports],
        ].map(([x, n]) => (
          <div className="card p-5" key={String(x)}>
            <p className="text-sm text-slate-600">{x}</p>
            <p className="mt-1 text-3xl font-bold">{n}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Accounts</h2>
      <p className="mt-1 text-sm text-slate-500">
        All registered accounts. Hold (suspend) / Restore / Make admin / Revoke admin / Delete.
      </p>
      <div className="mt-5 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3">Member</th>
              <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
              <th className="p-3">Member since</th>
              <th className="p-3 text-right">Active reports</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className={u.role === "SUSPENDED" ? "bg-slate-50/50" : ""}>
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
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-amber-100 text-amber-800" : u.role === "SUSPENDED" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}`}
                  >
                    {u.role === "ADMIN" && <ShieldCheck size={12} />}
                    {roleLabel[u.role as string]}
                    {u.role === "ADMIN" && " (verified reporter)"}
                  </span>
                </td>
                                <td className="p-3 text-slate-600">{new Date(u.createdAt).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}</td>
                <td className="p-3 text-right">{reportCount[u.id] ?? 0}</td>
                <td className="p-3">
                  <div className="flex justify-center gap-1">
                    {u.role === "USER" && (
                      <>
                        <form action={setRole.bind(null, u.id, "SUSPENDED")}><button className="btn-secondary" title="Hold (suspend)">Hold</button></form>
                        <form action={setRole.bind(null, u.id, "ADMIN")}><button className="btn-secondary" title="Make admin">Make admin</button></form>
                      </>
                    )}
                    {u.role === "ADMIN" && (
                      <>
                        <form action={setRole.bind(null, u.id, "SUSPENDED")}><button className="btn-secondary" title="Hold">Hold</button></form>
                        <form action={setRole.bind(null, u.id, "USER")}><button className="btn-secondary" title="Revoke admin">Revoke admin</button></form>
                      </>
                    )}
                    {u.role === "SUSPENDED" && (
                      <>
                        <form action={setRole.bind(null, u.id, "USER")}><button className="btn-secondary" title="Restore">Restore</button></form>
                        <form action={setRole.bind(null, u.id, "ADMIN")}><button className="btn-secondary" title="Make admin">Make admin</button></form>
                      </>
                    )}
                                        <AdminResetButton userId={u.id} username={u.username} />
                    <ConfirmButton action={deleteUser.bind(null, u.id)} label={u.displayName} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p className="mt-5 text-sm text-slate-500">No accounts found.</p>}
      <p className="mt-8 rounded-lg bg-slate-100 p-4 text-sm">
        Administrative access is enforced on the server. User moderation is backed by the Report and User records.
      </p>
    </main>
  );
}
