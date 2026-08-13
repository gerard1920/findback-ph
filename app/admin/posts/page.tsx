export const dynamic = "force-dynamic";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PostRow } from "@/components/admin-post-row";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const type = (sp?.type as string) || "ALL";
  const status = (sp?.status as string) || "ALL";
  const flagged = (sp?.flagged as string) || "ALL";
  const q = ((sp?.q as string) || "").trim();

  const where: Prisma.ItemWhereInput = {};
  if (type !== "ALL") where.type = type;
  if (status !== "ALL") where.status = status;
  if (flagged === "true") where.flagged = true;
  if (flagged === "false") where.flagged = false;
  if (q) {
    where.OR = [
      { title: { contains: q.toLowerCase() } },
      { description: { contains: q.toLowerCase() } },
      { owner: { displayName: { contains: q.toLowerCase() } } },
    ];
  }

  const posts = await db.item.findMany({
    where,
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      flagged: true,
      city: true,
      province: true,
      createdAt: true,
      owner: { select: { id: true, displayName: true, username: true } },
      category: { select: { name: true } },
      images: { select: { url: true, alt: true }, take: 1 },
      _count: { select: { reports: true, claims: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Posts</h1>
      <p className="mt-1 text-sm text-slate-500">Browse reported or suspicious posts. Hide, restore, resolve, flag, or delete.</p>

      <form className="mt-5 flex flex-wrap items-end gap-3" method="get">
        <div className="flex-1 min-w-52">
          <label className="label">Search</label>
          <input name="q" defaultValue={q} placeholder="Title, location, owner…" className="mt-1" />
        </div>
        <div>
          <label className="label">Type</label>
          <select name="type" defaultValue={type} className="mt-1">
            <option value="ALL">All</option>
            <option value="LOST">Lost</option>
            <option value="FOUND">Found</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status} className="mt-1">
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="MATCHED">Matched</option>
            <option value="CLAIM_PENDING">Claim pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REMOVED">Removed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <div>
          <label className="label">Flagged</label>
          <select name="flagged" defaultValue={flagged} className="mt-1">
            <option value="ALL">All</option>
            <option value="true">Flagged</option>
            <option value="false">Not flagged</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Filter</button>
        <a href="/admin/posts" className="btn-secondary">Reset</a>
      </form>

      <div className="mt-5 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3">Post</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Flagged</th>
              <th className="p-3">Reports / Claims</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </tbody>
        </table>
      </div>
      {posts.length === 0 && <p className="mt-5 text-sm text-slate-500">No posts match your filters.</p>}
    </div>
  );
}

