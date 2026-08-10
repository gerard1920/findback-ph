"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { resetPassword, type FormState } from "@/app/actions";

export function ResetForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FormState | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < 8;
  const tooLong = password.length > 72;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordMismatch || tooShort || tooLong) return;

    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("token", token);
      fd.set("password", password);
      const res = await resetPassword({}, fd);
      setResult(res);
      if (!res.error) {
        setPassword("");
        setConfirm("");
      }
    } catch (e: any) {
      setResult({ error: e?.message ?? "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  const isSuccess = !!result?.success;

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      {isSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Password reset successful</p>
              <p className="mt-1 text-sm text-emerald-800">{result.success}</p>
              <a
                href="/login"
                className="mt-3 inline-block text-sm font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
              >
                Go to login →
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
                required
                disabled={busy}
                autoComplete="new-password"
                className={`block w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  (tooShort || tooLong) && password.length > 0
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className={`mt-1 text-xs ${(tooShort || tooLong) && password.length > 0 ? "text-rose-600" : "text-slate-500"}`}>
              8 to 72 characters required.
            </p>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <div className="relative mt-1">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                maxLength={72}
                required
                disabled={busy}
                autoComplete="new-password"
                className={`block w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  passwordMismatch && confirm.length > 0
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordMismatch && confirm.length > 0 && (
              <p className="mt-1 text-xs text-rose-600">Passwords do not match.</p>
            )}
          </div>

          {result?.error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
              <p role="alert" className="text-sm text-rose-700">{result.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || passwordMismatch || tooShort || tooLong}
            className="btn-primary w-full disabled:opacity-60"
          >
            {busy ? "Setting…" : "Set new password"}
          </button>
        </>
      )}
    </form>
  );
}

