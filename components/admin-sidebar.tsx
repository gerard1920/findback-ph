"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  BarChart3,
  Settings,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

const secondaryLinks = [
  { href: "/admin/stats", label: "Statistics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:block">
      <div className="flex h-screen flex-col overflow-y-auto">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            <svg
              viewBox="0 0 40 40"
              className="h-7 w-7 text-brand-700 dark:text-brand-300"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect x="2" y="2" width="36" height="36" rx="10" fill="currentColor" opacity="0.1" />
              <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <circle cx="20" cy="20" r="5" fill="currentColor" />
            </svg>
            <span>FindBack Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {sidebarLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-50 text-brand-900 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          <div className="my-4 border-t border-slate-200 dark:border-slate-700" />

          {secondaryLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-50 text-brand-900 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
