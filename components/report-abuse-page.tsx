"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { reportItem, type FormState } from "@/app/actions";

const REASONS = [
  { id: "FAKE_LISTING", label: "Fake listing" },
  { id: "SCAM", label: "Scam attempt" },
  { id: "HARASSMENT", label: "Harassment or abuse" },
  { id: "STOLEN", label: "Looks like a stolen item" },
  { id: "INAPPROPRIATE", label: "Inappropriate content" },
  { id: "SPAM", label: "Spam / repeated posting" },
  { id: "SUSPICIOUS", label: "Suspicious behavior" },
];

export default function ReportAbuseClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const itemId = params.get("item") ?? "";

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (_prev: FormState, fd: FormData) => reportItem({}, fd),
    {},
  );

  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (state?.success) {
      toast({
        variant: "success",
        title: "Report submitted",
        description: state.success + " Redirecting to the lost items feed…",
        durationMs: 3800,
      });
      const t = window.setTimeout(() => router.push("/lost"), 1400);
      return () => window.clearTimeout(t);
    }
    if (state?.error) {
      toast({ variant: "error", title: "Report didn't go through", description: state.error });
    }
  }, [state, router, toast]);

  function validate(): boolean {
    const nextTouched = { reason: true, details: true, contact: true };
    setTouched(nextTouched);
    const errs: Record<string, string | undefined> = {};
    if (!reason) errs.reason = "Pick a reason that best describes the issue.";
    if (details.trim().length < 10)
      errs.details = "Please give us at least 10 characters so we can investigate.";
    if (details.trim().length > 2000) errs.details = "Keep it under 2000 characters.";
    if (contact && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contact))
      errs.contact = "If provided, enter a valid email so we can follow up.";
    setErrors(errs);
    return Object.values(errs).every((v) => !v);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!validate()) {
      e.preventDefault();
      toast({
        variant: "error",
        title: "Please fix the highlighted fields",
        description: "Reason and details are required before we can accept your report.",
      });
    }
  }

  return (
    <main className="container-page py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/lost"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-700 hover:-translate-x-0.5"
        >
          <ArrowLeft size={16} /> Back to listings
        </Link>

        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-50 p-6 shadow-sm ring-1 ring-rose-100">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/20">
            <AlertTriangle size={26} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Report a listing</h1>
          <p className="mt-2 text-slate-600">
            Our Safety team reviews every report. Including specific details helps us act faster and protect
            the community.
          </p>
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/70 p-3 ring-1 ring-rose-100">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <p className="text-xs leading-relaxed text-rose-900/90">
              <strong className="font-bold">Privacy first.</strong> Your identity stays anonymous from the
              person you&apos;re reporting. If you leave your email, it&apos;s used only to follow up with
              you about the investigation.
            </p>
          </div>
        </div>

        <form action={formAction} onSubmit={onSubmit} noValidate className="card mt-8 space-y-5 p-6">
          <input type="hidden" name="itemId" value={itemId} />
          {itemId && (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reporting listing</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                Item ID: <code className="rounded bg-white px-1.5 py-0.5 font-mono">{itemId}</code>
              </p>
            </div>
          )}

          <div>
            <span className="label">
              Reason <span className="text-rose-600">*</span>
            </span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {REASONS.map((r) => {
                const active = reason === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setReason(r.id);
                      if (touched.reason) setErrors((e) => ({ ...e, reason: undefined }));
                    }}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${
                      active
                        ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="reason" value={reason} />
            {touched.reason && errors.reason ? (
              <p className="mt-2 text-xs font-medium text-rose-700">{errors.reason}</p>
            ) : null}
          </div>

          <label className="block">
            <span className="label">
              What happened? <span className="text-rose-600">*</span>
            </span>
            <textarea
              name="details"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                if (touched.details) {
                  const ok = e.target.value.trim().length >= 10 && e.target.value.length <= 2000;
                  setErrors((er) => ({
                    ...er,
                    details: ok ? undefined : er.details,
                  }));
                }
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, details: true }));
                const tooShort = details.trim().length < 10;
                const tooLong = details.length > 2000;
                setErrors((e) => ({
                  ...e,
                  details: tooShort
                    ? "Please give us at least 10 characters so we can investigate."
                    : tooLong
                    ? "Keep it under 2000 characters."
                    : undefined,
                }));
              }}
              rows={6}
              maxLength={2000}
              required
              placeholder="Tell us exactly what you saw. Include timestamps, screenshots, links, or other evidence that might help."
              className={touched.details && errors.details ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className={touched.details && errors.details ? "font-medium text-rose-700" : "text-slate-500"}>
                {touched.details && errors.details ? errors.details : "Be specific — it helps us act faster."}
              </span>
              <span className={`font-bold ${details.length > 1900 ? "text-amber-600" : "text-slate-400"}`}>
                {details.length}/2000
              </span>
            </div>
          </label>

          <label className="block">
            <span className="label">Contact email (optional)</span>
            <input
              type="email"
              name="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, contact: true }));
                if (contact && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contact)) {
                  setErrors((e) => ({ ...e, contact: "Enter a valid email if you want to be contacted." }));
                } else {
                  setErrors((e) => ({ ...e, contact: undefined }));
                }
              }}
              placeholder="you@email.com — we&apos;ll only use this to follow up with you"
              className={touched.contact && errors.contact ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
            />
            {touched.contact && errors.contact ? (
              <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.contact}</p>
            ) : null}
          </label>

          <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <Link href="/lost" className="btn-ghost px-5 py-3">Cancel</Link>
            <button type="submit" disabled={pending || !reason} className="btn-primary items-center justify-center min-w-[240px]">
              {pending ? (
                <>
                  <Spinner size="xs" className="text-white" />
                  Submitting report…
                </>
              ) : (
                <>
                  <Send size={15} /> Submit report
                </>
              )}
            </button>
          </div>

          {state?.success && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
              {state.success}
            </p>
          )}
          {state?.error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {state.error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
