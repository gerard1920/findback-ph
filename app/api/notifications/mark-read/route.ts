import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { publishToUser } from "@/lib/messaging-realtime"

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json()
    const { notificationId } = body
    const userId = user.id

    if (notificationId) {
      const result = await db.notification.updateMany({
        where: { id: notificationId, userId },
        data: { readAt: new Date() },
      })

      if (result.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const notification = await db.notification.findUnique({ where: { id: notificationId } })

      await publishToUser(userId, "notification_read", {
        notificationId,
        userId,
      })

      return NextResponse.json({ success: true, notification })
    }

    const result = await db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })

    await publishToUser(userId, "all_notifications_read", {
      userId,
      count: result.count,
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Error marking notification(s) as read:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}