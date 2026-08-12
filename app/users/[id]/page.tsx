import { notFound } from "next/navigation";import { db } from "@/lib/db";import { currentUser } from "@/lib/auth";import { ItemCard } from "@/components/item-card";import { ReportUserForm } from "@/components/report-user-form";import { ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reported?: string }>;
}) {
  const { id } = await params;
  const { reported = "" } = await searchParams;
  const viewer = await currentUser();
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, displayName: true, username: true, role: true, createdAt: true },
  });
  if (!user) notFound();
  const active: Array<"ACTIVE" | "MATCHED" | "CLAIM_PENDING"> = ["ACTIVE", "MATCHED", "CLAIM_PENDING"];
  const [items, lostCount, foundCount] = await Promise.all([
    db.item.findMany({
      where: { ownerId: user.id, status: { in: active } },
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        city: true,
        province: true,
        dateOccurred: true,
        images: { select: { url: true }, take: 1 },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.item.count({ where: { ownerId: user.id, type: "LOST", status: { in: active } } }),
    db.item.count({ where: { ownerId: user.id, type: "FOUND", status: { in: active } } }),
  ]);
  const initials = (user.displayName.match(/\b\w/g) ?? ["?"]).slice(0, 2).join("").toUpperCase();
  const roleLabel = user.role === "ADMIN" ? "Admin" : user.role === "SUSPENDED" ? "Suspended" : "Member";
  return (
    <main className="container-page max-w-5xl py-10">
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blue-700 text-2xl font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{user.displayName}</h1>{user.role==="ADMIN"?<span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"><ShieldCheck size={12}/> Verified reporter</span>:null}
          <p className="mt-0.5 text-sm text-slate-500">
            @{user.username} · {roleLabel} · Member since {new Date(user.createdAt).toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm sm:justify-start">
            <span><b>{lostCount}</b> lost report{lostCount === 1 ? "" : "s"}</span>
            <span><b>{foundCount}</b> found report{foundCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>
      {viewer && viewer.id !== user.id && (
        <>
          {reported === "1" && (
            <div className="mt-3 mb-2 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={16} />
              <span>Your report was submitted and is awaiting review. Thank you.</span>
            </div>
          )}
          <ReportUserForm targetUserId={user.id} />
        </>
      )}
      <h2 className="mt-8 text-xl font-bold">Active reports</h2>
      {items.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <ItemCard key={i.id} item={i} mine={false} />)}
        </div>
      ) : (
        <div className="card mt-5 p-10 text-center text-slate-600">
          This member doesn&apos;t have any active reports right now.
        </div>
      )}
    </main>
  );
}