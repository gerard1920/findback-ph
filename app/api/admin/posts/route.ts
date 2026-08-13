import { NextRequest, NextResponse } from "next/server";
import { Prisma, ItemType, ItemStatus } from "@prisma/client";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const me = await requireAdminApi();
  if (!me) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "ALL";
  const status = searchParams.get("status") || "ALL";
  const flagged = searchParams.get("flagged");
  const q = (searchParams.get("q") || "").trim();
  const take = Math.min(Math.max(parseInt(searchParams.get("take") || "50", 10), 1), 100);

  const where: Prisma.ItemWhereInput = {};
    if (type !== "ALL") where.type = type as unknown as ItemType;
  if (status !== "ALL") where.status = status as unknown as ItemStatus;
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
    take,
  });

  return NextResponse.json(posts);
}
