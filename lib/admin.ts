import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Canonical set of default values every ADMIN account must have.
 * All admin creation paths (seed, first-user, promote-to-admin) MUST use
 * these exact defaults so every administrator sees identical data and
 * behaves consistently.
 */
export const STANDARD_ADMIN_DEFAULTS = {
  role: "ADMIN",
  status: "ACTIVE",
  notifyOnCommentEmail: true,
  notifyOnCommentInApp: true,
  notifyOnClaimEmail: true,
  notifyOnClaimInApp: true,
  notifyOnMessageEmail: true,
  notifyOnMessageInApp: true,
} as const;

/**
 * Fields required to be populated (non-null where nullable) for a consistent
 * admin record.  Used by the normalization step below.
 */
const REQUIRED_ADMIN_BOOLEAN_FIELDS = [
  "notifyOnCommentEmail",
  "notifyOnCommentInApp",
  "notifyOnClaimEmail",
  "notifyOnClaimInApp",
  "notifyOnMessageEmail",
  "notifyOnMessageInApp",
] as const;

/**
 * Given a user record, returns the set of fields that need to be updated so
 * the record matches the standardized ADMIN profile.  Returns `null` if the
 * record is already consistent (so the caller can skip the update).
 */
export function computeAdminNormalization(user: {
  id: string;
  role: string;
  status: string;
  notifyOnCommentEmail?: boolean;
  notifyOnCommentInApp?: boolean;
  notifyOnClaimEmail?: boolean;
  notifyOnClaimInApp?: boolean;
  notifyOnMessageEmail?: boolean;
  notifyOnMessageInApp?: boolean;
}) {
  if (user.role !== "ADMIN") return null;

  const updates: Partial<{
    status: string;
    notifyOnCommentEmail: boolean;
    notifyOnCommentInApp: boolean;
    notifyOnClaimEmail: boolean;
    notifyOnClaimInApp: boolean;
    notifyOnMessageEmail: boolean;
    notifyOnMessageInApp: boolean;
  }> = {};

  if (user.status !== STANDARD_ADMIN_DEFAULTS.status) {
    updates.status = STANDARD_ADMIN_DEFAULTS.status;
  }
  for (const key of REQUIRED_ADMIN_BOOLEAN_FIELDS) {
    if (user[key] !== STANDARD_ADMIN_DEFAULTS[key]) {
      updates[key] = STANDARD_ADMIN_DEFAULTS[key];
    }
  }
  return Object.keys(updates).length > 0 ? updates : null;
}

/**
 * Scans every ADMIN in the database and normalizes any records that don't
 * match the standard admin profile.  Guarantees that every admin (current
 * AND future ones added by any other means) ends up with identical fields
 * before they can reach the admin area.
 *
 * Runs inside `requireAdmin()` so any admin page load triggers one pass.
 * Safe to call repeatedly — no-ops when everything is already consistent.
 */
export async function ensureAllAdminsNormalized(): Promise<number> {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      role: true,
      status: true,
      notifyOnCommentEmail: true,
      notifyOnCommentInApp: true,
      notifyOnClaimEmail: true,
      notifyOnClaimInApp: true,
      notifyOnMessageEmail: true,
      notifyOnMessageInApp: true,
    },
  });

  let normalized = 0;
  for (const admin of admins) {
    const patch = computeAdminNormalization(admin);
    if (patch) {
      await db.user.update({ where: { id: admin.id }, data: patch });
      normalized++;
    }
  }
  return normalized;
}

/**
 * Server-side admin guard for page routes (uses redirects).
 * - Returns the admin user, or redirects non-admins away from the admin area.
 * - **Before returning**, runs `ensureAllAdminsNormalized()` so that every
 *   admin (current or future promoted) always has a fully consistent record
 *   and every admin sees the exact same dataset.
 * Used by every admin page route.
 */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  try {
    await ensureAllAdminsNormalized();
  } catch {
    // Never block the admin UI on a normalization glitch; the guard is
    // best-effort and can be re-run manually via scripts/ensure-admin-consistency.ts
  }
  return user;
}

/**
 * API-level admin guard.  Same guarantees as `requireAdmin()` but returns
 * `null` instead of redirecting so the caller can return a 403 JSON response.
 * Runs admin normalization before returning so admin API endpoints also see
 * a fully consistent admin set regardless of which admin calls them.
 */
export async function requireAdminApi() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return null;
  try {
    await ensureAllAdminsNormalized();
  } catch {
    // best-effort only — don't fail the API call on normalization errors
  }
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