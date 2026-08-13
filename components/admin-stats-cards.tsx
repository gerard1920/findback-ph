"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, BarChart3, History, Users } from "lucide-react";

type Stats = {
  users: number;
  admins: number;
  bannedUsers: number;
  suspendedUsers: number;
  activeItems: number;
  lostActive: number;
  foundActive: number;
  pendingReports: number;
  totalReports: number;
};

type Props = {
  initialStats: Stats;
};

export function AdminStatsCards({ initialStats }: Props) {
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (res.ok && mounted) {
          const data = await res.json();
          setStats((prev) => ({
            users: data.users ?? prev.users,
            admins: data.admins ?? prev.admins,
            bannedUsers: data.bannedUsers ?? prev.bannedUsers,
            suspendedUsers: data.suspendedUsers ?? prev.suspendedUsers,
            activeItems: data.activeItems ?? prev.activeItems,
            lostActive: data.lostActive ?? prev.lostActive,
            foundActive: data.foundActive ?? prev.foundActive,
            pendingReports: data.pendingReports ?? prev.pendingReports,
            totalReports: data.totalReports ?? prev.totalReports,
          }));
        }
      } catch {
        // ignore poll failures
      }
    }

    const id = setInterval(refresh, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const statCards: Array<{
    label: string;
    value: number;
    icon: React.ReactNode;
    href?: string;
    accent: string;
  }> = [
    { label: "Total users", value: stats.users, icon: <Users size={16} />, href: "/admin/users", accent: "text-indigo-700 bg-indigo-50 ring-indigo-200" },
    { label: "Administrators", value: stats.admins, icon: <ShieldCheck size={16} />, href: "/admin/users", accent: "text-violet-700 bg-violet-50 ring-violet-200" },
    { label: "Banned users", value: stats.bannedUsers, icon: <BarChart3 size={16} />, href: "/admin/users?status=BANNED", accent: "text-rose-700 bg-rose-50 ring-rose-200" },
    { label: "Suspended users", value: stats.suspendedUsers, icon: <BarChart3 size={16} />, href: "/admin/users?status=SUSPENDED", accent: "text-amber-700 bg-amber-50 ring-amber-200" },
    { label: "Active posts", value: stats.activeItems, icon: <BarChart3 size={16} />, href: "/admin/posts", accent: "text-emerald-700 bg-emerald-50 ring-emerald-200" },
    { label: "Active lost", value: stats.lostActive, icon: <BarChart3 size={16} />, href: "/admin/posts?type=LOST", accent: "text-orange-700 bg-orange-50 ring-orange-200" },
    { label: "Active found", value: stats.foundActive, icon: <BarChart3 size={16} />, href: "/admin/posts?type=FOUND", accent: "text-sky-700 bg-sky-50 ring-sky-200" },
    { label: "Pending reports", value: stats.pendingReports, icon: <History size={16} />, href: "/admin/reports", accent: "text-amber-700 bg-amber-50 ring-amber-200" },
    { label: "Total reports", value: stats.totalReports, icon: <History size={16} />, href: "/admin/reports", accent: "text-slate-700 bg-slate-100 ring-slate-200" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {statCards.map((c) => (
        <Link
          key={c.label}
          href={c.href ?? "/admin"}
          className="card-hover flex items-center gap-4 p-5"
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${c.accent}`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-600">{c.label}</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
