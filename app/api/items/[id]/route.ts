import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser, requireUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = await db.item.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            campus: true,
          },
        },
        images: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found or has been removed." },
        { status: 404 },
      );
    }

    const user = await currentUser();
    const mine = user?.id === item.ownerId;

    if (item.status === "REMOVED" && !mine) {
      return NextResponse.json(
        { error: "Item not found or has been removed." },
        { status: 404 },
      );
    }

    const payload = {
      id: item.id,
      ownerId: item.ownerId,
      title: item.title,
      type: item.type,
      status: item.status,
      description: item.description,
      city: item.city,
      province: item.province,
      barangay: item.barangay,
      approximateLocation: item.approximateLocation,
      dateOccurred: item.dateOccurred,
      brand: item.brand,
      color: item.color,
      distinguishingFeatures: item.distinguishingFeatures,
      reward: item.reward,
      latitude: item.latitude,
      longitude: item.longitude,
      createdAt: item.createdAt,
      category: item.category,
      owner: {
        id: item.owner.id,
        displayName: item.owner.displayName,
        username: item.owner.username,
        avatarUrl: item.owner.avatarUrl,
        campus: item.owner.campus,
      },
      images: item.images,
      mine,
    };

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("Failed to fetch item:", error);
    return NextResponse.json(
      { error: "Unable to load this item." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await db.item.findUnique({ where: { id }, select: { ownerId: true } });
    if (!item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }
    if (item.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    await db.item.update({
      where: { id },
      data: { status: "REMOVED" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Failed to delete item." },
      { status: 500 },
    );
  }
}
