import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { publishToUser } from "@/lib/messaging-realtime"

export async function GET(_request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await request.json();
    const { type, title, message: bodyMessage, icon, referenceId, referenceType } = body;

    if (!title || !bodyMessage) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        userId: user.id,
        type: type || "general",
        title,
        body: bodyMessage,
        icon: icon || "",
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        link: referenceId ? (referenceType === "item" ? `/items/${referenceId}` : `/dashboard/notifications`) : null,
        readAt: null,
      },
    });

    await publishToUser(user.id, "new_notification", {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.body,
      icon: notification.icon,
      referenceId: notification.referenceId,
      referenceType: notification.referenceType,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}