"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { login, register, type FormState } from "@/app/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Mail, Lock, User, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^(\+?63|0)9\d{9}$/;

type Mode = "login" | "register";

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
}

export function AuthForm({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const search = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const next = search.get("next") ?? "/dashboard";

  const [loginState, loginAction, loginPending] = useActionState<FormState, FormData>(login, {});
  const [regState, regAction, regPending] = useActionState<FormState, FormData>(register, {});

  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const lastProcessedRef = useRef<{ login: string; register: string }>({ login: "", register: "" });

  useEffect(() => {
    const state = mode === "login" ? loginState : regState;
    const stateKey = mode === "login" ? "login" : "register";
    const fingerprint =
      (state.success ? "s:" + state.success : "") + "|" + (state.error ? "e:" + state.error : "");
    if (lastProcessedRef.current[stateKey] === fingerprint) return;
    lastProcessedRef.current[stateKey] = fingerprint;
    if (!state.success && !state.error) return;
    if (state?.success) {
      toast({
        variant: "success",
        title: mode === "login" ? "Welcome back" : "Account created",
        description: state.success + " Redirecting…",
        durationMs: 2600,
      });
      const goto = mode === "login" ? next : "/settings";
      const t = window.setTimeout(() => router.push(goto), 700);
      return () => window.clearTimeout(t);
    }
    if (state?.error) {
      toast({
        variant: "error",
        title: mode === "login" ? "Unable to sign in" : "Couldn't create account",
        description: state.error,
        durationMs: 5000,
      });
    }
  }, [loginState, regState, mode, next, router, toast]);

  const errors = useMemo(() => {
    const e: Partial<Record<"email" | "password" | "name" | "phone", string>> = {};
    if (touched.email) {
      if (!form.email) e.email = "Please enter your email.";
      else if (!EMAIL_RE.test(form.email)) e.email = "That doesn't look like a valid email.";
    }
    if (touched.password) {
      if (!form.password) e.password = "Please enter a password.";
      else if (mode === "register" && form.password.length < 8)
        e.password = "Use at least 8 characters.";
    }
    if (mode === "register" && touched.name && form.name.trim().length < 2)
      e.name = "Please enter at least 2 characters.";
    if (mode === "register" && touched.phone && form.phone && !PHONE_RE.test(form.phone))
      e.phone = "Use a valid PH number (09171234567).";
    return e;
  }, [form, touched, mode]);

  const pwScore = strength(form.password);

  function handleClient(e: React.FormEvent<HTMLFormElement>) {
    const allTouched = { email: true, password: true, name: true, phone: true };
    setTouched(allTouched);
    const hasErr =
      !EMAIL_RE.test(form.email) ||
      !form.password ||
      (mode === "register" && form.password.length < 8) ||
      (mode === "register" && form.name.trim().length < 2) ||
      (mode === "register" && form.phone && !PHONE_RE.test(form.phone));
    if (hasErr) {
      e.preventDefault();
      toast({
        variant: "error",
        title: "Please check your details",
        description: "Fix the highlighted fields, then try again.",
      });
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setTouched({});
    lastProcessedRef.current = { login: "", register: "" };
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800">
        <Sparkles size={16} />
        {mode === "login" ? "Secure, verified Filipino community." : "Free, no credit card required."}
      </div>
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="grid w-full grid-cols-2 overflow-hidden rounded-2xl bg-slate-100 p-1 font-semibold"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => switchMode("login")}
          className={`rounded-xl px-4 py-2.5 text-sm transition-all duration-300 ${
            mode === "login"
              ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          onClick={() => switchMode("register")}
          className={`rounded-xl px-4 py-2.5 text-sm transition-all duration-300 ${
            mode === "register"
              ? "bg-white text-fuchsia-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Create account
        </button>
      </div>

      <form
        action={mode === "login" ? loginAction : regAction}
        onSubmit={handleClient}
        noValidate
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="next" value={next} />

        {mode === "register" && (
          <label className="block">
            <span className="label">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} /> Full name <span className="text-rose-600">*</span>
              </span>
            </span>
            <input
              name="displayName"
              value={form.name}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              minLength={2}
              maxLength={60}
              placeholder="Juan Dela Cruz"
              className={errors.name ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
            />
            {errors.name && <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.name}</p>}
          </label>
        )}

        <label className="block">
          <span className="label">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} /> Email <span className="text-rose-600">*</span>
            </span>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="you@email.com"
            className={errors.email ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
          />
          {touched.email && form.email ? (
            <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium ${EMAIL_RE.test(form.email) ? "text-emerald-700" : "text-slate-500"}`}>
              {EMAIL_RE.test(form.email) ? (
                <>
                  <CheckCircle2 size={14} /> Email looks valid.
                </>
              ) : (
                <>
                  <XCircle size={14} /> Checking format…
                </>
              )}
            </p>
          ) : errors.email ? (
            <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.email}</p>
          ) : null}
        </label>

        {mode === "register" && (
          <label className="block">
            <span className="label">Mobile number</span>
            <input
              name="phoneNumber"
              inputMode="tel"
              value={form.phone}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="09171234567"
              maxLength={15}
              className={errors.phone ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
            />
            {errors.phone && <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.phone}</p>}
          </label>
        )}

        <label className="block">
          <span className="label">
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} /> Password <span className="text-rose-600">*</span>
            </span>
          </span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={form.password}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
            placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
            className={errors.password ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
          />
          {mode === "register" && form.password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Strength</span>
                <span
                  className={`font-bold ${
                    pwScore <= 1
                      ? "text-rose-600"
                      : pwScore === 2
                      ? "text-amber-600"
                      : pwScore === 3
                      ? "text-sky-600"
                      : "text-emerald-600"
                  }`}
                >
                  {["Too weak", "Weak", "Fair", "Good", "Strong"][pwScore]}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-300 ${
                    ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"][pwScore]
                  }`}
                  style={{ width: `${(pwScore / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
          {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.password}</p>}
        </label>

        {mode === "login" && (
          <div className="flex justify-end text-xs">
            <Link
              href="/forgot-password"
              className="font-semibold text-indigo-700 transition hover:text-indigo-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loginPending || regPending}
          className="btn-primary w-full items-center justify-center py-3.5 text-base"
        >
          {loginPending || regPending ? (
            <>
              <Spinner size="sm" className="text-white" />
              {mode === "login" ? "Signing you in…" : "Creating account…"}
            </>
          ) : (
            <>
              {mode === "login" ? "Sign in" : "Create free account"}
              <span aria-hidden>→</span>
            </>
          )}
        </button>

        <p className="pt-1 text-center text-xs text-slate-500">
          By continuing you agree to our Terms &amp; Privacy.
        </p>
      </form>
    </div>
  );
}
