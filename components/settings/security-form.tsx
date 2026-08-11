"use client";
import { useActionState, useEffect, useMemo, useState } from "react";
import { changePassword } from "@/app/actions";
import type { FormState } from "@/app/actions";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  const score = Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

export function SecurityForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(changePassword, {});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [touched, setTouched] = useState<{ new: boolean; confirm: boolean }>({ new: false, confirm: false });
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        variant: "success",
        title: "Password updated",
        description: state.success + " Your account is more secure now. 🎉",
        durationMs: 3400,
      });
      setNewPw("");
      setConfirmPw("");
      setTouched({ new: false, confirm: false });
    } else if (state?.error) {
      toast({
        variant: "error",
        title: "Couldn't update password",
        description: state.error,
      });
    }
  }, [state, toast]);

  const strength = useMemo(() => scorePassword(newPw), [newPw]);
  const matches = confirmPw.length > 0 && newPw === confirmPw;
  const mismatch = touched.confirm && confirmPw.length > 0 && !matches;

  const strengthColor = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-emerald-500",
  ][strength.score];

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (mismatch) {
          e.preventDefault();
          toast({
            variant: "error",
            title: "Passwords don't match",
            description: "Make sure your new password and confirmation are identical.",
          });
        }
        if (strength.score < 1) {
          e.preventDefault();
          toast({
            variant: "error",
            title: "Password is too weak",
            description: "Use at least 8 characters, a mix of letters and numbers.",
          });
        }
      }}
      noValidate
      className="max-w-xl space-y-5"
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">🔒 Change your password</p>
        <p className="mt-1 text-xs text-amber-800">
          Choose a strong password (8–72 characters). Mix letters, numbers, and symbols for best security.
        </p>
      </div>

      <label className="block">
        <span className="label">
          Current password <span className="text-rose-600">*</span>
        </span>
        <div className="relative">
          <input
            name="currentPassword"
            required
            minLength={8}
            maxLength={72}
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your current password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-600"
            aria-label="Toggle current password visibility"
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="label">
          New password <span className="text-rose-600">*</span>
        </span>
        <div className="relative">
          <input
            name="newPassword"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, new: true }))}
            required
            minLength={8}
            maxLength={72}
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowNew((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-600"
            aria-label="Toggle new password visibility"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {newPw.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Strength</span>
              <span
                className={`font-bold ${
                  strength.score <= 1
                    ? "text-rose-600"
                    : strength.score === 2
                    ? "text-amber-600"
                    : strength.score === 3
                    ? "text-sky-600"
                    : "text-emerald-600"
                }`}
              >
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-300 ${strengthColor}`}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
            <ul className="mt-2 grid gap-1 text-[12px] text-slate-500 sm:grid-cols-2">
              {[
                { label: "At least 8 characters", ok: newPw.length >= 8 },
                { label: "Upper + lowercase", ok: /[A-Z]/.test(newPw) && /[a-z]/.test(newPw) },
                { label: "At least one number", ok: /\d/.test(newPw) },
                { label: "Symbol (recommended)", ok: /[^A-Za-z0-9]/.test(newPw) },
              ].map((r) => (
                <li key={r.label} className="inline-flex items-center gap-1.5">
                  {r.ok ? (
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  ) : (
                    <XCircle size={13} className="text-slate-300" />
                  )}
                  <span className={r.ok ? "text-slate-700" : ""}>{r.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </label>

      <label className="block">
        <span className="label">
          Confirm new password <span className="text-rose-600">*</span>
        </span>
        <div className="relative">
          <input
            name="confirmPassword"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            required
            minLength={8}
            maxLength={72}
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className={`pr-12 ${
              mismatch ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-600"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {touched.confirm && confirmPw && (
          <p
            className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium ${
              matches ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {matches ? (
              <>
                <CheckCircle2 size={14} /> Passwords match — good to go.
              </>
            ) : (
              <>
                <XCircle size={14} /> Passwords don&apos;t match yet.
              </>
            )}
          </p>
        )}
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          {state.success}
        </p>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button type="submit" disabled={pending} className="btn-primary min-w-[240px] items-center justify-center">
          {pending ? (
            <>
              <Spinner size="xs" className="text-white" />
              Updating password…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </div>
    </form>
  );
}
