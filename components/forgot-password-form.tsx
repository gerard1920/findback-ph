"use client";
import { useActionState, useEffect, useMemo, useState } from "react";
import { requestPasswordReset, type FormState } from "@/app/actions";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const { toast } = useToast();

  const error = useMemo(() => {
    if (!touched) return undefined;
    if (!email) return "Enter the email associated with your account.";
    if (!EMAIL_RE.test(email)) return "That doesn't look like a valid email.";
    return undefined;
  }, [email, touched]);

  useEffect(() => {
    if (state?.success) {
      toast({
        variant: "success",
        title: "Check your inbox 📧",
        description: state.success,
        durationMs: 6000,
      });
    } else if (state?.error) {
      toast({
        variant: "error",
        title: "Couldn't send reset email",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Link
        href="/auth"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-700 hover:-translate-x-0.5"
      >
        <ArrowLeft size={16} /> Back to sign in
      </Link>
      <div className="mb-6 flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">
        <Sparkles size={16} /> Reset link goes to your email inbox — never shown here.
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        Reset your password
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Enter the email you used to sign up. We&apos;ll email you a secure link with instructions
        to pick a new password.
      </p>

      <form
        action={formAction}
        onSubmit={(e) => {
          setTouched(true);
          if (!EMAIL_RE.test(email)) {
            e.preventDefault();
            toast({
              variant: "error",
              title: "Enter a valid email",
              description: "Use the email address you signed up with.",
            });
          }
        }}
        noValidate
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="email" value={email} />
        <label className="block">
          <span className="label">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} /> Email address <span className="text-rose-600">*</span>
            </span>
          </span>
          <input
            name="email_display"
            type="email"
            autoComplete="email"
            value={email}
            onBlur={() => setTouched(true)}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
            className={error ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
          />
          {touched && email ? (
            <p
              className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium ${
                EMAIL_RE.test(email) ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {EMAIL_RE.test(email) ? (
                <>
                  <CheckCircle2 size={14} /> Ready to send.
                </>
              ) : (
                <>
                  <XCircle size={14} /> Email format invalid.
                </>
              )}
            </p>
          ) : error ? (
            <p className="mt-1.5 text-xs font-medium text-rose-700">{error}</p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary shine w-full items-center justify-center py-3.5 text-base"
        >
          {pending ? (
            <>
              <Spinner size="sm" className="text-white" />
              Sending reset link…
            </>
          ) : (
            <>
              Send password reset link
              <span aria-hidden>→</span>
            </>
          )}
        </button>

        <p className="rounded-xl bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
          💡 <strong className="text-slate-800">Tip:</strong> If you don&apos;t see the email in 2 minutes,
          check your Spam / Promotions folder and add &quot;FindBack PH&quot; to contacts to avoid delays.
        </p>
      </form>
    </div>
  );
}
