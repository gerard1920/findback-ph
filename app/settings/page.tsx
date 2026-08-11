import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import type { ActivityItem } from "@/components/settings/my-activity-list";

export default async function SettingsPage() {
  const lite = await currentUser();
  if (!lite) redirect("/login?next=/settings");

  const user = await db.user.findUnique({
    where: { id: lite.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      phoneNumber: true,
      campus: true,
      preferredProvince: true,
      preferredCity: true,
      notifyOnCommentEmail: true,
      notifyOnCommentInApp: true,
      notifyOnClaimEmail: true,
      notifyOnClaimInApp: true,
      notifyOnMessageEmail: true,
      notifyOnMessageInApp: true,
    },
  });
  if (!user) redirect("/login?next=/settings");

  const [lostRaw, foundRaw] = await Promise.all([
    db.item.findMany({
      where: { ownerId: user.id, type: "LOST" },
      include: { images: { orderBy: { createdAt: "asc" }, take: 1 } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    db.item.findMany({
      where: { ownerId: user.id, type: "FOUND" },
      include: { images: { orderBy: { createdAt: "asc" }, take: 1 } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const toActivity = (r: typeof lostRaw[number]): ActivityItem => ({
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description,
    status: r.status as ActivityItem["status"],
    province: r.province,
    city: r.city,
    approximateLocation: r.approximateLocation,
    dateOccurred: r.dateOccurred.toISOString(),
    createdAt: r.createdAt.toISOString(),
    images: r.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt })),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, security, notifications, and view all your reported items.
        </p>
      </div>
      <SettingsTabs
        initialUser={{
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          phoneNumber: user.phoneNumber,
          campus: user.campus,
          preferredProvince: user.preferredProvince,
          preferredCity: user.preferredCity,
          notifyOnCommentEmail: user.notifyOnCommentEmail,
          notifyOnCommentInApp: user.notifyOnCommentInApp,
          notifyOnClaimEmail: user.notifyOnClaimEmail,
          notifyOnClaimInApp: user.notifyOnClaimInApp,
          notifyOnMessageEmail: user.notifyOnMessageEmail,
          notifyOnMessageInApp: user.notifyOnMessageInApp,
        }}
        lostItems={lostRaw.map(toActivity)}
        foundItems={foundRaw.map(toActivity)}
      />
    </div>
  );
}
