import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Server-side admin guard.
 * Returns the admin user, or redirects non-admins away from the admin area.
 * Used by every admin page route.
 */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

/**
 * Records an administrator action in the AdminLog table.
 * Called on the server only, from admin server actions.
 */
export async function logAdmin(opts: {
  adminId: string;
  action: string;
  targetType: string; // "USER" | "ITEM" | "REPORT" | "SYSTEM"
  targetId?: string | null;
  reason?: string | null;
}) {
  const { adminId, action, targetType, targetId, reason } = opts;
  await db.adminLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId: targetId ?? null,
      reason: reason ?? null,
    },
  });
}

/**
 * Builds a friendly "what happened" line for the activity log table,
 * e.g. "banned USER_105 for 'Scam attempt'".
 */
export function describeAdminAction(action: string, targetType: string, targetId?: string | null, reason?: string | null): string {
  const base =
    action === "BAN"
      ? `banned ${targetType}${targetId ? ` ${targetId}` : ""}`
      : action === "SUSPEND"
        ? `suspended ${targetType}${targetId ? ` ${targetId}` : ""}`
        : action === "UNBAN"
          ? `unbanned ${targetType}${targetId ? ` ${targetId}` : ""}`
          : action === "DELETE_USER"
            ? `deleted user${targetId ? ` ${targetId}` : ""}`
            : action === "DELETE_ITEM"
              ? `deleted post${targetId ? ` ${targetId}` : ""}`
              : action === "HIDE_ITEM"
                ? `hid post${targetId ? ` ${targetId}` : ""}`
                : action === "RESTORE_ITEM"
                  ? `restored post${targetId ? ` ${targetId}` : ""}`
                  : action === "RESOLVE_ITEM"
                    ? `marked post resolved${targetId ? ` ${targetId}` : ""}`
                    : action === "FLAG_ITEM"
                      ? `flagged post as suspicious${targetId ? ` ${targetId}` : ""}`
                      : action === "UNFLAG_ITEM"
                        ? `cleared suspicious flag${targetId ? ` ${targetId}` : ""}`
                        : action === "MAKE_ADMIN"
                          ? `made admin${targetId ? ` ${targetId}` : ""}`
                          : action === "REVOKE_ADMIN"
                            ? `revoked admin${targetId ? ` ${targetId}` : ""}`
                            : action === "REVIEW_REPORT"
                              ? `marked report reviewing${targetId ? ` ${targetId}` : ""}`
                              : action === "RESOLVE_REPORT"
                                ? `resolved report${targetId ? ` ${targetId}` : ""}`
                                : action === "REJECT_REPORT"
                                  ? `dismissed report${targetId ? ` ${targetId}` : ""}`
                                  : action === "WARN"
                                    ? `warned ${targetType}${targetId ? ` ${targetId}` : ""}`
                                    : `${action} ${targetType}${targetId ? ` ${targetId}` : ""}`;
  return reason ? `${base} — "${reason}"` : base;
}