import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const id = (await params).id;
    const updated = await db.item.updateMany({
      where: { id, ownerId: user.id, status: { notIn: ["RESOLVED", "REMOVED"] } },
      data: { status: "RESOLVED" },
    });
    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Item not found, not yours, or already closed." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, status: "RESOLVED" });
  } catch (error) {
    console.error("Recover error:", error);
    return NextResponse.json(
      { error: "Failed to mark item as recovered." },
      { status: 500 },
    );
  }
}
