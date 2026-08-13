import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

const ACTIVE = ["ACTIVE", "MATCHED", "CLAIM_PENDING"] as const;

export async function GET() {
  // requireAdminApi runs the admin normalization pass before returning,
  // so every admin (regardless of who they are) sees a fully consistent
  // admin set and identical counts.
  const me = await requireAdminApi();
  if (!me) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

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
    recentBans,
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
    db.ban.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  return NextResponse.json({
    users,
    admins,
    bannedUsers,
    suspendedUsers,
    activeItems,
    lostActive,
    foundActive,
    pendingReports,
    totalReports,
    recentBans,
  });
}
