import { activeUser } from "@/lib/auth";
import { SuspendedNotice } from "@/components/suspended-notice";
import { db } from "@/lib/db";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

export default async function NotificationsPage() {
  const _a = await activeUser();
  if (!_a.ok) {
    return <SuspendedNotice reason={_a.reason} message={_a.message} />;
  }
  const u = _a.user;
  const ns = await db.notification.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
  });
  await db.notification.updateMany({
    where: { userId: u.id, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <main className="container-page max-w-3xl py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-600">Updates about your reports, matches, and messages.</p>
        </div>
        <span className="pill-indigo inline-flex items-center gap-1.5">
          <CheckCheck size={14} /> All marked as read
        </span>
      </div>

      <div className="mt-7 space-y-3">
        {ns.length ? (
          ns.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className="card block p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <Bell size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {n.createdAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Bell size={22} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">You&apos;re all caught up!</h2>
            <p className="text-sm text-slate-600">New notifications will appear here when something happens with your reports.</p>
          </div>
        )}
      </div>
    </main>
  );
}
