"use client";
import { useState } from "react";
import { ProfileForm } from "@/components/settings/profile-form";
import { SecurityForm } from "@/components/settings/security-form";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { MyActivityList, type ActivityItem } from "@/components/settings/my-activity-list";
import { UserCircle2, ShieldCheck, Bell, ClipboardList } from "lucide-react";

export type SettingsTabsProps = {
  initialUser: {
    email: string;
    displayName: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
    campus: string | null;
    preferredProvince: string | null;
    preferredCity: string | null;
    notifyOnCommentEmail: boolean;
    notifyOnCommentInApp: boolean;
    notifyOnClaimEmail: boolean;
    notifyOnClaimInApp: boolean;
    notifyOnMessageEmail: boolean;
    notifyOnMessageInApp: boolean;
  };
  lostItems: ActivityItem[];
  foundItems: ActivityItem[];
};

const TABS = [
  { id: "profile", label: "Profile", Icon: UserCircle2 },
  { id: "security", label: "Security", Icon: ShieldCheck },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "activity", label: "My Activity", Icon: ClipboardList },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs(props: SettingsTabsProps) {
  const [active, setActive] = useState<TabId>("profile");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav
        aria-label="Settings tabs"
        className="w-full shrink-0 lg:sticky lg:top-24 lg:w-60"
      >
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition lg:w-full ${
                active === id
                  ? "bg-blue-50 text-blue-800 ring-1 ring-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-current={active === id ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8">
        {active === "profile" && (
          <>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Profile</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update your personal information, avatar, and preferred campus/location.
              </p>
            </div>
            <ProfileForm
              initial={{
                displayName: props.initialUser.displayName,
                phone: props.initialUser.phoneNumber ?? "",
                city: props.initialUser.preferredCity ?? "",
                province: props.initialUser.preferredProvince ?? "",
                campus: props.initialUser.campus ?? "",
                avatarUrl: props.initialUser.avatarUrl,
              }}
            />
          </>
        )}

        {active === "security" && (
          <>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                Change your account password to keep your account secure.
              </p>
            </div>
            <SecurityForm />
          </>
        )}

        {active === "notifications" && (
          <>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose how you want to be notified about activity on your account.
              </p>
            </div>
            <NotificationsForm initial={{
              notifyOnCommentEmail: props.initialUser.notifyOnCommentEmail,
              notifyOnCommentInApp: props.initialUser.notifyOnCommentInApp,
              notifyOnClaimEmail: props.initialUser.notifyOnClaimEmail,
              notifyOnClaimInApp: props.initialUser.notifyOnClaimInApp,
              notifyOnMessageEmail: props.initialUser.notifyOnMessageEmail,
              notifyOnMessageInApp: props.initialUser.notifyOnMessageInApp,
            }} />
          </>
        )}

        {active === "activity" && (
          <>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">My Dashboard / My Activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                View, edit, delete, and mark resolved all items you have reported.
              </p>
            </div>
            <MyActivityList lostItems={props.lostItems} foundItems={props.foundItems} />
          </>
        )}
      </div>
    </div>
  );
}
