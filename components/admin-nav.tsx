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
    <nav className="border-b bg-white">
      <div className="container-page flex items-center gap-2 overflow-x-auto py-1 text-sm">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-lg border-b-2 px-3 py-2 font-medium whitespace-nowrap",
                active
                  ? "border-blue-700 text-blue-800"
                  : "border-transparent text-slate-600 hover:text-slate-900",
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
