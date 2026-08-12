import { NextResponse } from "next/server";
import { currentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const itemId = (await params).id;
    const item = await db.item.findUnique({ where: { id: itemId }, select: { id: true } });
    if (!item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }
    await db.savedItem.upsert({
      where: { userId_itemId: { userId: user.id, itemId } },
      create: { userId: user.id, itemId },
      update: {},
    });
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to save item." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const itemId = (await params).id;
    await db.savedItem.deleteMany({
      where: { userId: user.id, itemId },
    });
    return NextResponse.json({ saved: false });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to remove item." },
      { status: 500 },
    );
  }
}

export async function HEAD() {
  const user = await currentUser();
  if (!user) {
    return new NextResponse(null, { status: 401 });
  }
  return new NextResponse(null, { status: 200 });
}
