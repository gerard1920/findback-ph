export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { activeUser } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { db } from "@/lib/db";
import { ItemCard, parseCardItem } from "@/components/item-card";
import { SuspendedNotice } from "@/components/suspended-notice";
import {
  PackageSearch,
  Bell,
  MessageSquare,
  Heart,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";

export default async function Dashboard() {
  const _a = await activeUser();
  if (!_a.ok) {
    if (_a.reason === "UNAUTHENTICATED") redirect("/login");
    return <SuspendedNotice reason={_a.reason} message={_a.message} />;
  }
  const user = _a.user;

  if (!(await isDatabaseAvailable())) {
    return (
      <main className="container-page py-10">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">We can’t load your dashboard right now because the database is unavailable.</p>
      </main>
    );
  }

  const [items, matches, saved, unread, claims] = await Promise.all([
    db.item.findMany({
      where: { ownerId: user.id, status: { not: "REMOVED" } },
      include: { images: { take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.match.count({
      where: {
        OR: [
          {
            lostItemId: {
              in: (
                await db.item.findMany({
                  where: { ownerId: user.id, status: { not: "REMOVED" } },
                  select: { id: true },
                })
              ).map((x) => x.id),
            },
          },
          {
            foundItemId: {
              in: (
                await db.item.findMany({
                  where: { ownerId: user.id, status: { not: "REMOVED" } },
                  select: { id: true },
                })
              ).map((x) => x.id),
            },
          },
        ],
      },
    }),
    db.savedItem.count({ where: { userId: user.id } }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.claim.count({
      where: {
        item: { ownerId: user.id, status: { not: "REMOVED" } },
        status: { in: ["PENDING", "UNDER_REVIEW"] },
      },
    }),
  ]);

  const lost = items.filter((i) => i.type === "LOST").length;
  const found = items.filter((i) => i.type === "FOUND").length;

  const stats = [
    { label: "Lost reports", value: lost, icon: PackageSearch, href: "/dashboard?filter=lost" },
    { label: "Found reports", value: found, icon: PackageSearch, href: "/dashboard?filter=found" },
    { label: "Possible matches", value: matches, icon: ClipboardList, href: "/dashboard/matches" },
    { label: "Unread notifications", value: unread, icon: Bell, href: "/dashboard/notifications" },
  ];

  const quickLinks = [
    { label: "Messages", value: "Open chats", icon: MessageSquare, href: "/messages", accent: "text-indigo-700 bg-indigo-50" },
    { label: "Saved items", value: `${saved} saved`, icon: Heart, href: "/dashboard/saved", accent: "text-rose-700 bg-rose-50" },
    { label: "Claims to review", value: `${claims} pending`, icon: ClipboardList, href: "/dashboard/claims", accent: "text-amber-700 bg-amber-50" },
  ];

  return (
    <main className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.displayName || user.username}
          </h1>
          <p className="mt-2 text-slate-600">Manage your reports and community activity.</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" href="/report/found">
            Report found
          </Link>
          <Link className="btn-primary" href="/report/lost">
            Report lost
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="card-hover flex items-center gap-4 p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <ArrowUpRight size={16} className="ml-auto hidden shrink-0 text-slate-400 lg:block" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {quickLinks.map(({ label, value, icon: Icon, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="card-hover flex items-center gap-4 p-5"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${accent}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="mt-0.5 text-xs text-slate-600">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">My reports</h2>
          <Link href="/dashboard/settings" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
            View all
          </Link>
        </div>
        {items.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={parseCardItem(item)} mine={true} />
            ))}
          </div>
        ) : (
          <div className="card mt-5 p-10 text-center">
            <p className="text-slate-600">You haven&apos;t reported anything yet.</p>
            <Link className="btn-primary mt-4" href="/report/lost">
              Report lost item
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
