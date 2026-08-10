import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.item.count({
      where: {
        status: {
          in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"],
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to count items:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
