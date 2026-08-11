import { ShieldAlert, LogIn } from "lucide-react";
import Link from "next/link";

export function SuspendedNotice({
  reason,
  message,
}: {
  reason: "UNAUTHENTICATED" | "SUSPENDED" | "BANNED";
  message: string;
}) {
  const title = reason === "UNAUTHENTICATED" ? "Sign in required" : "Account suspended";
  const subtitle =
    reason === "BANNED"
      ? "Your account has been banned and is no longer accessible."
      : reason === "SUSPENDED"
        ? "Your account is temporarily suspended from Lost & Found PH."
        : "You need to be signed in to view this page.";

  return (
    <main className="container-page flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <ShieldAlert className="h-8 w-8 text-rose-700" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-slate-600">{subtitle}</p>
      {reason !== "UNAUTHENTICATED" && message && (
        <p className="mt-3 max-w-md rounded-lg bg-slate-100 p-3 text-sm text-slate-700">Reason: {message}</p>
      )}
      <p className="mt-5 max-w-md text-sm text-slate-500">
        If you believe this was a mistake, contact the site administrator. You will be redirected to the
        sign-in page.
      </p>
      <Link href="/login" className="mt-5 inline-flex items-center gap-2 btn-primary">
        <LogIn size={16} />
        Return to sign in
      </Link>
    </main>
  );
}
