import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const me = await requireAdminApi();
  if (!me) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";
  const reason = searchParams.get("reason") || "ALL";
  const take = Math.min(Math.max(parseInt(searchParams.get("take") || "50", 10), 1), 100);

  const where: Prisma.ReportWhereInput = {};
  if (status !== "ALL") where.status = status;
    if (reason !== "ALL") where.reason = reason;

  const reports = await db.report.findMany({
    where,
    select: {
      id: true,
      status: true,
      reason: true,
      details: true,
      createdAt: true,
      resolvedAt: true,
      reporter: { select: { id: true, displayName: true, username: true, email: true } },
      reportedUser: { select: { id: true, displayName: true, username: true, email: true, status: true, role: true } },
      item: {
        select: { id: true, title: true, type: true, status: true, flagged: true, owner: { select: { id: true, displayName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(reports);
}
