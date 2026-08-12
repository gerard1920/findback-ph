"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="container-page flex items-center gap-1 overflow-x-auto py-1 text-sm">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-lg px-3 py-2 font-semibold whitespace-nowrap transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
