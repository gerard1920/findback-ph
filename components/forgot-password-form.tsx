"use client";

import { useState } from "react";
import { requestPasswordReset, type FormState } from "@/app/actions";

interface ForgotPasswordFormProps {
  isResendConfigured?: boolean;
}

export function ForgotPasswordForm({ isResendConfigured = true }: ForgotPasswordFormProps) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FormState | null>(null);
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
    } catch (e: any) {
      setResult({ error: e?.message ?? "Something went wrong." });
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
          disabled={busy || !isResendConfigured}
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {!isResendConfigured && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            The email service is currently unavailable. Please try again later or contact support.
          </p>
        </div>
      )}

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

      <button type="submit" disabled={busy || !isResendConfigured} className="btn-primary w-full disabled:opacity-60">
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
