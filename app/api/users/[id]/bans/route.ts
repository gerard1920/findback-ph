import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const target = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const bans = await db.ban.findMany({
    where: { userId: id },
    select: {
      id: true,
      action: true,
      reason: true,
      expiresAt: true,
      liftedAt: true,
      createdAt: true,
      admin: { select: { id: true, displayName: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bans);
}
