"use client";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
type NotificationPayload = {
  id: string;
  userId: string;
  type?: string;
  title?: string;
  body?: string;
  message?: string;
  icon?: string;
  referenceId?: string | null;
  referenceType?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt?: string | null;
};

export function NotificationsBrowser({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let disposed = false;

    const loadInitial = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const raw = await res.json();
        if (disposed) return;

        const transformed: Notification[] = raw.map((n: NotificationPayload) => ({
          id: n.id,
          userId: n.userId,
          type: n.type || "general",
          title: n.title ?? "",
          message: n.body ?? "",
          icon: n.icon || "Bell",
          referenceId: n.referenceId ?? null,
          referenceType: n.referenceType ?? null,
          isRead: !!n.readAt,
          link: n.link ?? null,
          createdAt: n.createdAt ?? "",
        }));

        setNotifications(transformed);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        if (!disposed) setError("Failed to load notifications");
      } finally {
        if (!disposed) setIsLoading(false);
      }
    };

    loadInitial();

    const channel = supabase
      .channel(`user:${userId}`)
      .on("broadcast", { event: "new_notification" }, (payload: { payload: Record<string, unknown> }) => {
        const n = payload.payload as NotificationPayload;
        if (!n || !n.id) return;

        setNotifications((prev) => {
          if (prev.some((p) => p.id === n.id)) return prev;
          return [
            {
              id: n.id,
              userId: n.userId,
              type: n.type || "general",
              title: n.title ?? "",
              message: n.message ?? "",
              icon: n.icon || "Bell",
              referenceId: n.referenceId ?? null,
              referenceType: n.referenceType ?? null,
              isRead: !!n.readAt,
              link: (n as NotificationPayload & { link?: string | null }).link ?? null,
              createdAt: n.createdAt
                ? new Date(n.createdAt).toISOString()
                : new Date().toISOString(),
            },
            ...prev,
          ];
        });
      })
      .on("broadcast", { event: "notification_read" }, (payload: { payload: Record<string, unknown> }) => {
        const { notificationId } = payload.payload || {};
        setNotifications((prev) =>
          prev.map((p) => (p.id === notificationId ? { ...p, isRead: true } : p))
        );
      })
      .on("broadcast", { event: "all_notifications_read" }, () => {
        setNotifications((prev) =>
          prev.map((p) => (p.isRead ? p : { ...p, isRead: true }))
        );
      })
      .subscribe();

    return () => {
      disposed = true;
      channel.unsubscribe();
    };
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string, link?: string | null) => {
    const target = link || "/dashboard/notifications";
    setNotifications((prev) =>
      prev.map((p) => (p.id === notificationId ? { ...p, isRead: true } : p))
    );
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
        credentials: "same-origin",
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
    router.push(target);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((p) => ({ ...p, isRead: true })));
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "same-origin",
      });
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  if (isLoading) {
    return (
      <main className="container-page max-w-3xl py-10">
        <h1 className="section-title">Notifications</h1>
        <p className="mt-2 text-ink-soft">Loading notifications&hellip;</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container-page max-w-3xl py-10">
        <h1 className="section-title">Notifications</h1>
        <p className="mt-2 text-ink-soft">We couldn&apos;t load your notifications. Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="container-page max-w-3xl py-10 space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between gap-4">
        <div>
          <span className="section-label">Inbox</span>
          <h1 className="font-display mt-3 section-title">Notifications</h1>
          <p className="mt-2 text-base text-ink-soft">Updates about your reports, matches, and messages.</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-success-700 transition hover:bg-success-100"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length ? (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleMarkAsRead(n.id, n.link)}
              className="card-hover block w-full p-4 text-left transition"
            >
              <div className="flex items-start gap-3">
                <div className="stat-icon">
                  <Bell size={16} className={n.isRead ? "" : "text-primary"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    {!n.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{n.message}</p>
                  <p className="font-mono mt-1.5 text-xs text-ink-soft">
                    {new Date(n.createdAt).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="empty-state">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary-soft/30">
              <Bell size={28} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">You&apos;re all caught up!</h3>
            <p className="max-w-sm text-sm text-ink-soft">New notifications will appear here when something happens with your reports.</p>
          </div>
        )}
      </div>
    </main>
  );
}
