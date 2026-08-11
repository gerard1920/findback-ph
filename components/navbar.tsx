"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  LogOut,
  PlusSquare,
  Search,
  Sparkles,
} from "lucide-react";
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
      if (
        userMenuOpen &&
        userPopRef.current &&
        !userPopRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
      if (
        mobileOpen &&
        mobilePopRef.current &&
        !mobilePopRef.current.contains(target)
      ) {
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2 font-extrabold tracking-tight text-slate-900"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-sm text-white shadow-lg shadow-indigo-900/10 ring-1 ring-white transition-transform duration-200 group-hover:scale-105">
              FB
            </span>
            <span className="hidden text-[15px] sm:block">
              FindBack{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                PH
              </span>
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
              placeholder="Search lost items, wallets, phones…"
              className="h-10 w-72 rounded-xl border border-slate-200 bg-white/70 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
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
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                )}
              </Link>
            );
          })}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200/60 transition hover:from-amber-100 hover:to-amber-200"
            >
              🛡 Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/report/lost"
                className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-900/10 ring-1 ring-rose-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex active:scale-[0.97]"
              >
                <PlusSquare size={15} /> Report lost
              </Link>
              <Link
                aria-label="Notifications"
                href="/dashboard/notifications"
                className="group relative hidden rounded-xl p-2 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
              >
                <Bell size={19} />
                <span className="absolute right-1.5 top-1.5 grid h-2 w-2 place-items-center rounded-full bg-rose-500 ring-2 ring-white group-hover:scale-110" />
              </Link>

              <div ref={userPopRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 active:scale-[0.98]"
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
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-sm font-bold text-white ring-2 ring-white shadow">
                      {user.displayName?.charAt(0)?.toUpperCase() ||
                        user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-white p-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-base font-bold text-white ring-2 ring-white shadow">
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
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800"
                      >
                        <LayoutDashboard
                          size={16}
                          className="text-slate-500"
                        />{" "}
                        Dashboard
                      </Link>
                      <Link
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-indigo-800 transition-colors hover:bg-indigo-50"
                      >
                        <Settings size={16} /> My Account / Settings
                      </Link>
                      <Link
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        href="/dashboard/notifications"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800 sm:hidden"
                      >
                        <Bell size={16} className="text-slate-500" />{" "}
                        Notifications
                      </Link>
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
                className="btn-primary btn-primary--violet inline-flex items-center gap-1.5 text-sm active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" />
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 md:hidden active:scale-[0.97]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          ref={mobilePopRef}
          className="animate-in slide-in-from-top-2 fade-in duration-200 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl md:hidden"
        >
          <div className="container-page space-y-2 py-4">
            <form onSubmit={onSearchSubmit} role="search" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder="Search lost items…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </form>
            <nav className="grid gap-1 pt-2">
              {NAV_LINKS.map((l) => {
                const active = isActivePath(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 px-3.5 py-2.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200/60"
                >
                  🛡 Admin dashboard
                </Link>
              )}
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
                    className="btn-primary btn-primary--violet w-full justify-center text-sm"
                  >
                    ⚙️ My Account / Settings
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/report/lost"
                      className="btn-rose w-full justify-center text-sm"
                    >
                      Report lost
                    </Link>
                    <Link
                      href="/report/found"
                      className="btn-primary btn-primary--emerald w-full justify-center text-sm"
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
                    className="btn-primary btn-primary--violet w-full justify-center gap-1.5 text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
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
