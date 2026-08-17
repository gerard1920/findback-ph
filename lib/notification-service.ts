import { db } from "@/lib/db";
import { sendGenericEmail, canSendEmail } from "@/lib/mail";
import { publishToUser } from "@/lib/messaging-realtime";

export type NotificationCategory =
  | "possible_match"
  | "similar_found"
  | "report_update"
  | "item_status"
  | "message"
  | "message_request"
  | "suspicious"
  | "security"
  | "account"
  | "important_email"
  | "weekly_summary";

const CATEGORY_PREFS: Record<NotificationCategory, { inApp: string | null; email: string }> = {
  possible_match: { inApp: "notifyPossibleMatchInApp", email: "notifyPossibleMatchEmail" },
  similar_found: { inApp: "notifySimilarFoundInApp", email: "notifySimilarFoundEmail" },
  report_update: { inApp: "notifyReportUpdatesInApp", email: "notifyReportUpdatesEmail" },
  item_status: { inApp: "notifyItemStatusInApp", email: "notifyItemStatusEmail" },
  message: { inApp: "notifyOnMessageInApp", email: "notifyOnMessageEmail" },
  message_request: { inApp: "notifyMessageRequestInApp", email: "notifyMessageRequestEmail" },
  suspicious: { inApp: "notifySuspiciousInApp", email: "notifySuspiciousEmail" },
  security: { inApp: "notifySecurityInApp", email: "notifySecurityEmail" },
  account: { inApp: "notifyAccountInApp", email: "notifyAccountEmail" },
  important_email: { inApp: null, email: "notifyImportantEmail" },
  weekly_summary: { inApp: null, email: "notifyWeeklySummary" },
};

function categoryForType(type: string): NotificationCategory {
  switch (type) {
    case "message": return "message";
    case "claim":
    case "comment": return "report_update";
    case "match": return "possible_match";
    case "status":
    case "item_status": return "item_status";
    case "message_request": return "message_request";
    case "security": return "security";
    case "suspicious": return "suspicious";
    case "admin": return "account";
    default: return "report_update";
  }
}

function notificationEmailHtml(title: string, body: string, name: string): string {
  const t = `${title}`.replace(/[<>&]/g, "");
  const b = `${body}`.replace(/[<>&]/g, "");
  const n = `${name}`.replace(/[<>&]/g, "");
  return `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:0;background:#f5f5f5;font-family:Segoe UI,Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%"><tr><td style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:28px 40px;text-align:center"><span style="color:#fff;font-size:20px;font-weight:700">FindBack PH</span></td></tr><tr><td style="padding:32px 40px"><p style="margin:0 0 16px;color:#1b1e2e;font-size:16px;font-weight:600">${n ? `Hi ${n},` : "Hi,"}</p><p style="margin:0 0 8px;color:#334155;font-size:15px;line-height:1.6"><strong>${t}</strong></p><p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6">${b}</p><p style="margin:0;color:#94a3b8;font-size:12px">You received this because of your FindBack PH notification preferences. Change them anytime in Account Settings.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function createNotification(
  recipientUserId: string,
  notificationData: {
    type: string;
    title: string;
    message: string;
    icon?: string;
    referenceId?: string;
    referenceType?: string;
    category?: NotificationCategory;
  },
) {
  const { type, title, message, icon, referenceId, referenceType, category } = notificationData;
  const resolvedCategory = category ?? categoryForType(type);
  const prefs = CATEGORY_PREFS[resolvedCategory];

  let inAppAllowed = true;
  let emailAllowed = false;

  if (prefs) {
    const row = await db.user.findUnique({
      where: { id: recipientUserId },
      select: {
        ...(prefs.inApp ? { [prefs.inApp]: true } : {}),
        [prefs.email]: true,
        email: true,
        displayName: true,
        username: true,
      },
    });
    if (!row) return null;

    if (prefs.inApp) {
      inAppAllowed = Boolean(row[prefs.inApp as keyof typeof row]);
    }

    emailAllowed = Boolean(row[prefs.email as keyof typeof row]);
    if (emailAllowed && canSendEmail()) {
      try {
        await sendGenericEmail({
          to: String(row.email ?? ""),
          subject: title,
          html: notificationEmailHtml(title, message, String(row.displayName || row.username || "")),
        });
      } catch {
        // Never let an email failure break the in-app notification.
      }
    }
  }

  if (!inAppAllowed) return null;

  const link = referenceId
    ? referenceType === "conversation"
      ? `/messages/${referenceId}`
      : referenceType === "item"
        ? `/items/${referenceId}`
        : referenceType === "match"
          ? `/dashboard/matches`
          : `/dashboard/notifications`
    : null;

  const notification = await db.notification.create({
    data: {
      userId: recipientUserId,
      type,
      title,
      body: message,
      icon: icon || "",
      referenceId: referenceId || null,
      referenceType: referenceType || null,
      link,
      readAt: null,
    },
  });

  await publishToUser(recipientUserId, "new_notification", {
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

  return notification;
}

export async function getUnreadNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId, readAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const notification = await db.notification.update({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });

  await publishToUser(userId, "notification_read", {
    notificationId,
    userId,
  });

  return notification;
}

export async function markAllNotificationsAsRead(userId: string) {
  const result = await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  await publishToUser(userId, "all_notifications_read", {
    userId,
    count: result.count,
  });

  return result;
}