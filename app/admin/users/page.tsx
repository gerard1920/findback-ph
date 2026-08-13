export const dynamic = "force-dynamic";
import { Prisma, UserStatus, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { UserRow } from "@/components/admin-user-row";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = ((sp?.q as string) || "").trim();
  const status = (sp?.status as string) || "ALL";
  const role = (sp?.role as string) || "ALL";

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { displayName: { contains: q.toLowerCase() } },
      { username: { contains: q.toLowerCase() } },
      { email: { contains: q.toLowerCase() } },
    ];
  }
  if (status !== "ALL") where.status = status as UserStatus;
  if (role !== "ALL") where.role = role as Role;

  // Deterministic, admin-agnostic ordering: admins pinned to the top, then
  // most recently created.  This makes the list identical no matter which
  // admin is viewing it (matches the API endpoint's ordering).
  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { bans: true } },
      bans: {
        where: { liftedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { action: true, reason: true, createdAt: true },
      },
    },
    orderBy: [
      { role: "desc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-slate-500">
        Search, filter by status or role, and moderate accounts. Each action is recorded in the activity log.
      </p>

      <form className="mt-5 flex flex-wrap items-end gap-3" method="get">
        <div className="flex-1 min-w-52">
          <label className="label">Search</label>
          <input name="q" defaultValue={q} placeholder="Name, @username, email…" className="mt-1" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status} className="mt-1">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
        <div>
          <label className="label">Role</label>
          <select name="role" defaultValue={role} className="mt-1">
            <option value="ALL">All roles</option>
            <option value="USER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Filter</button>
        <a href="/admin/users" className="btn-secondary">Reset</a>
      </form>

      <div className="mt-5 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3">Member</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Active ban</th>
              <th className="p-3">Since</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p className="mt-5 text-sm text-slate-500">No users match your filters.</p>}
    </div>
  );
}

