import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const me = await currentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

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
        db.item.count({ where: { status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] } } }),
    db.item.count({ where: { type: "LOST", status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] } } }),
    db.item.count({ where: { type: "FOUND", status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] } } }),
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
