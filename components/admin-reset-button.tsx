"use client";

import { useState } from "react";
import { sendPasswordReset, type ResetState } from "@/app/actions";

export function AdminResetButton({ userId, username }: { userId: string; username: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResetState | null>(null);

  const handle = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await sendPasswordReset(userId, {}, new FormData());
      setResult(res);
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className="btn-secondary"
        title={`Send password-reset link to @${username}`}
      >
        {busy ? "Generating…" : "Send reset link"}
      </button>
      {result?.link && (
        <div className="mt-2 max-w-xs break-all rounded-md bg-emerald-50 p-2 text-xs text-emerald-800">
          <span className="font-semibold">Share this link with the customer:</span>
          <a
            href={result.link}
            className="mt-1 block break-all text-emerald-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            {result.link}
          </a>
          <p className="mt-1 text-emerald-700/80">
            Valid for 1 hour and single use. The customer sets their own password; it is never shown to admin.
          </p>
        </div>
      )}
      {result?.error && <p className="mt-1 text-xs text-rose-600">{result.error}</p>}
    </>
  );
}

