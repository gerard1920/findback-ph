import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserStatus, Role } from "@prisma/client";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  // requireAdminApi normalizes every admin record before returning, so
  // regardless of which admin makes this API call, they receive the exact
  // same view of the user list with fully consistent admin records.
  const me = await requireAdminApi();
  if (!me) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "ALL";
  const role = searchParams.get("role") || "ALL";
  const take = Math.min(Math.max(parseInt(searchParams.get("take") || "50", 10), 1), 100);

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { displayName: { contains: q.toLowerCase() } },
      { username: { contains: q.toLowerCase() } },
      { email: { contains: q.toLowerCase() } },
    ];
  }
  if (status !== "ALL") where.status = status as unknown as UserStatus;
  if (role !== "ALL") where.role = role as unknown as Role;

  // Deterministic, admin-agnostic ordering: admins first (role desc), then
  // most recently created.  This guarantees every admin sees the exact same
  // sort order so users don't appear/disappear between admin sessions.
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
      bans: { where: { liftedAt: null }, orderBy: { createdAt: "desc" }, take: 1, select: { id: true, action: true, reason: true, createdAt: true } },
      _count: { select: { bans: true, items: true, reportsMade: true } },
    },
    orderBy: [
      { role: "desc" },
      { createdAt: "desc" },
    ],
    take,
  });

  return NextResponse.json(users);
}
