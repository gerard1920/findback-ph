"use client";

import { useState } from "react";
import { requestPasswordReset, type ResetState } from "@/app/actions";

interface ForgotPasswordFormProps {
  isResendConfigured?: boolean;
}

export function ForgotPasswordForm({ isResendConfigured: _isResendConfigured = true }: ForgotPasswordFormProps) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResetState | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("email", email);
      const res = await requestPasswordReset({}, fd);
      setResult(res);
      if (!res.error) {
        setEmail("");
      }
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={busy}
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {result?.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p role="alert" className="text-sm text-rose-700">{result.error}</p>
        </div>
      )}

      {result?.success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm text-emerald-800">{result.success}</p>
        </div>
      )}

      {result?.link && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">🔗 Reset Link (clickable):</p>
          <a
            href={result.link}
            target="_blank"
            rel="noreferrer"
            className="block break-all text-sm text-blue-700 underline hover:text-blue-900 bg-white rounded px-3 py-2 border border-blue-200"
          >
            {result.link}
          </a>
          <p className="mt-3 text-xs text-blue-700">
            Tip: Click the link above to directly reset your password. Valid for 1 hour.
          </p>
        </div>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
