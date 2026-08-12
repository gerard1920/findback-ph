"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            FindBack PH ran into a problem while loading this page. If this keeps happening,
            the deployment may be missing required environment variables or database access.
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
      </body>
    </html>
  );
}
