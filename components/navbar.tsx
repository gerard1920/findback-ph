"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, X, Settings, LayoutDashboard, LogOut, PlusSquare, Search } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type NavbarUser = {
  id: string | number;
  email: string;
  displayName?: string | null;
  username: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
};

const NAV_LINKS = [
  { href: "/lost", label: "Lost Items" },
  { href: "/found", label: "Found Items" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/safety", label: "Safety" },
  { href: "/about", label: "About" },
];

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar({ user }: { user: NavbarUser | null }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userPopRef = useRef<HTMLDivElement>(null);
  const mobilePopRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (userMenuOpen && userPopRef.current && !userPopRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (mobileOpen && mobilePopRef.current && !mobilePopRef.current.contains(target)) {
        setMobileOpen(false);
      }
    }
    if (userMenuOpen || mobileOpen) {
      document.addEventListener("mousedown", onDoc);
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.body.style.overflow = "";
    };
  }, [userMenuOpen, mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setUserMenuOpen(false);
    setMobileOpen(false);
    toast({
      title: "Signing you out…",
      description: "See you soon!",
      variant: "info",
      durationMs: 1500,
    });
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // ignore network errors, always redirect
    }
    setTimeout(() => {
      toast({
        title: "Signed out",
        description: "You have been logged out of FindBack PH.",
        variant: "success",
      });
      window.location.href = "/";
    }, 600);
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    toast({
      title: `Searching "${q}"…`,
      description: "Jumping to lost items with your search.",
      variant: "info",
      durationMs: 1400,
    });
    const params = new URLSearchParams({ q });
    setTimeout(() => router.push(`/lost?${params.toString()}`), 250);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold tracking-tight text-slate-900"
            aria-label="FindBack PH — Home"
          >
            <svg
              viewBox="0 0 40 40"
              className="h-9 w-9 text-indigo-700"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect x="2" y="2" width="36" height="36" rx="10" fill="currentColor" opacity="0.1" />
              <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <circle cx="20" cy="20" r="5" fill="currentColor" />
            </svg>
            <span className="hidden sm:block text-[15px] tracking-tight">
              FindBack{" "}
              <span className="font-black text-indigo-700">PH</span>
            </span>
          </Link>
          <form
            onSubmit={onSearchSubmit}
            className="relative hidden md:block"
            role="search"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              placeholder="Search lost phones, wallets, IDs..."
              className="h-10 w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </form>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => {
            const active = isActivePath(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "text-indigo-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/report/lost"
                className="hidden items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 sm:inline-flex"
              >
                <PlusSquare size={15} /> Report lost
              </Link>
              <Link
                aria-label="Notifications"
                href="/dashboard/notifications"
                className="relative hidden rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
              >
                <Bell size={19} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </Link>

              <div ref={userPopRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Open user menu"
                >
                  <span className="hidden text-right sm:block">
                    <span className="block text-[11px] leading-tight text-slate-500">
                      Signed in
                    </span>
                    <span className="block max-w-[140px] truncate text-sm font-semibold leading-tight text-slate-900">
                      {user.displayName || user.username}
                    </span>
                  </span>
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow"
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-700 text-sm font-bold text-white ring-2 ring-white shadow">
                      {user.displayName?.charAt(0)?.toUpperCase() ||
                        user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-700 text-base font-bold text-white ring-2 ring-white shadow">
                            {user.displayName?.charAt(0)?.toUpperCase() ||
                              user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.displayName || user.username}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <LayoutDashboard size={16} className="text-slate-500" />
                        Dashboard
                      </Link>
                      <Link
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
                      >
                        <Settings size={16} /> My Account / Settings
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                        >
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <div className="my-2 border-t border-slate-100" />
                      <div className="grid grid-cols-2 gap-1.5 px-3 pb-2">
                        <Link
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          href="/report/lost"
                          className="rounded-xl bg-rose-50 px-3 py-2.5 text-center text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          Report lost
                        </Link>
                        <Link
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          href="/report/found"
                          className="rounded-xl bg-emerald-50 px-3 py-2.5 text-center text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          Report found
                        </Link>
                      </div>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-700 transition-colors hover:bg-rose-50"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="btn-secondary inline-flex items-center text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary inline-flex items-center gap-1.5 text-sm"
              >
                Create account
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          ref={mobilePopRef}
          className="border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
        >
          <div className="container-page space-y-2 py-4">
            <form onSubmit={onSearchSubmit} role="search" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder="Search lost items..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </form>
            <nav className="grid gap-1 pt-2">
              {NAV_LINKS.map((l) => {
                const active = isActivePath(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
            <div className="grid gap-2 border-t border-slate-100 pt-3 sm:hidden">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-secondary w-full justify-center text-sm"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="btn-primary w-full justify-center text-sm"
                  >
                    My Account / Settings
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/report/lost"
                      className="btn-lost w-full justify-center text-sm"
                    >
                      Report lost
                    </Link>
                    <Link
                      href="/report/found"
                      className="btn-found w-full justify-center text-sm"
                    >
                      Report found
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-secondary w-full justify-center border-rose-200 bg-rose-50 text-sm text-rose-700 hover:bg-rose-100"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    className="btn-secondary w-full justify-center text-sm"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary w-full justify-center text-sm"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
