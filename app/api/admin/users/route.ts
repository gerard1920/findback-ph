import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserStatus, Role } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const me = await currentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

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
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(users);
}
