import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await db.user.count();
    const itemCount = await db.item.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      users: userCount,
      items: itemCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        database: "unavailable",
        error: message,
      },
      { status: 500 }
    );
  }
}
