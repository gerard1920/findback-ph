"use client";
import { useState } from "react";
import { useActionState, useEffect } from "react";
import { updateNotificationPrefs, type NotifState, type NotificationPrefs } from "@/app/actions";
import { Mail, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

export function NotificationsForm({ initial }: { initial: NotificationPrefs }) {
  const [state, formAction, pending] = useActionState<NotifState, FormData>(
    updateNotificationPrefs,
    { ...initial },
  );
  const { toast } = useToast();
  const [values, setValues] = useState<NotificationPrefs>({
    notifyOnCommentEmail: initial.notifyOnCommentEmail,
    notifyOnCommentInApp: initial.notifyOnCommentInApp,
    notifyOnClaimEmail: initial.notifyOnClaimEmail,
    notifyOnClaimInApp: initial.notifyOnClaimInApp,
    notifyOnMessageEmail: initial.notifyOnMessageEmail,
    notifyOnMessageInApp: initial.notifyOnMessageInApp,
  });

  useEffect(() => {
    if (state?.success) {
      toast({
        variant: "success",
        title: "Preferences saved",
        description: state.success,
        durationMs: 2800,
      });
    } else if (state?.error) {
      toast({
        variant: "error",
        title: "Couldn't save preferences",
        description: state.error,
      });
    }
  }, [state, toast]);

  function toggle<K extends keyof NotificationPrefs>(key: K, next: boolean) {
    setValues((prev) => ({ ...prev, [key]: next }));
    toast({
      variant: "info",
      title: next ? "Notification enabled" : "Notification paused",
      description:
        key.includes("Email")
          ? "Email channel updated. Remember to save!"
          : "In-app channel updated. Remember to save!",
      durationMs: 1400,
    });
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-4">
      <input type="hidden" name="notifyOnCommentEmail" value={values.notifyOnCommentEmail ? "1" : "0"} />
      <input type="hidden" name="notifyOnCommentInApp" value={values.notifyOnCommentInApp ? "1" : "0"} />
      <input type="hidden" name="notifyOnClaimEmail" value={values.notifyOnClaimEmail ? "1" : "0"} />
      <input type="hidden" name="notifyOnClaimInApp" value={values.notifyOnClaimInApp ? "1" : "0"} />
      <input type="hidden" name="notifyOnMessageEmail" value={values.notifyOnMessageEmail ? "1" : "0"} />
      <input type="hidden" name="notifyOnMessageInApp" value={values.notifyOnMessageInApp ? "1" : "0"} />

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-900">🔔 Customize your alerts</p>
        <p className="mt-1 text-xs text-indigo-800/90">
          Choose how you want to be notified. You can enable or disable email and in-app notifications
          separately for each activity.
        </p>
      </div>

      {[
        {
          title: "Comments on your post",
          subtitle: "When someone leaves a comment on an item you reported.",
          emailKey: "notifyOnCommentEmail" as const,
          inAppKey: "notifyOnCommentInApp" as const,
        },
        {
          title: "Claims on your item",
          subtitle:
            "When someone claims your found item or matches your lost item and needs verification.",
          emailKey: "notifyOnClaimEmail" as const,
          inAppKey: "notifyOnClaimInApp" as const,
        },
        {
          title: "Direct messages",
          subtitle: "When another user sends you a private message about an item.",
          emailKey: "notifyOnMessageEmail" as const,
          inAppKey: "notifyOnMessageInApp" as const,
        },
      ].map((row) => (
        <div key={row.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[15px] font-semibold text-slate-900">{row.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{row.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <Switch
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Mail size={15} className="text-indigo-600" /> Email
                  </span>
                }
                checked={values[row.emailKey]}
                onChange={(n) => toggle(row.emailKey, n)}
                name={undefined}
              />
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <Switch
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Bell size={15} className="text-violet-600" /> In-app
                  </span>
                }
                checked={values[row.inAppKey]}
                onChange={(n) => toggle(row.inAppKey, n)}
                name={undefined}
              />
            </div>
          </div>
        </div>
      ))}

      {state?.error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          {state.success}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <p className="mr-auto text-xs text-slate-500">
          Tip: in-app notifications are instant — email delivers within ~1 minute.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary min-w-[220px] items-center justify-center"
        >
          {pending ? (
            <>
              <Spinner size="xs" className="text-white" />
              Saving preferences…
            </>
          ) : (
            "Save preferences"
          )}
        </button>
      </div>
    </form>
  );
}
