"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server errors to the console for debugging without exposing internals
    // to end users in the browser UI.
    console.error("Route segment error:", error?.digest ?? error?.message);
  }, [error]);

  return (
    <main className="container-page flex min-h-[50vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Couldn&apos;t load this content
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We hit a temporary hiccup while loading this page. This usually means the
          database is briefly unavailable. Please try again in a moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            Go to homepage
          </Link>
        </div>
        {error?.digest ? (
          <p className="mt-4 text-xs text-slate-400">Error reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
