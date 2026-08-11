"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type Variant = "default" | "danger" | "warn" | "secondary";

const variantClass: Record<Variant, string> = {
  default: "btn-secondary",
  danger: "btn bg-rose-700 text-white hover:bg-rose-800",
  warn: "btn bg-amber-600 text-white hover:bg-amber-700",
  secondary: "btn-secondary",
};

export interface AdminActionFormProps {
  /** Bound server action: (userId, fd) => Promise. Pass e.g. adminBanUser.bind(null, id). */
  action: (fd: FormData) => Promise<void>;
  label: string;
  /** Preset reasons that fill the reason field. */
  presets?: string[];
  defaultReason?: string;
  confirmLabel?: string;
  variant?: Variant;
  icon?: ReactNode;
  /** If true, no modal — submits immediately with defaultReason (still posts reason). */
  immediate?: boolean;
}

export function AdminActionForm({
  action,
  label,
  presets = [],
  defaultReason = "",
  confirmLabel = "Confirm",
  variant = "default",
  icon,
  immediate = false,
}: AdminActionFormProps) {
    const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(defaultReason || "");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    if (!immediate && !reason.trim()) {
      e.preventDefault();
      return;
    }
    // the form action handles redirect server-side
  };

  if (immediate) {
    return (
      <form action={action} onSubmit={submit}>
        <input type="hidden" name="reason" defaultValue={defaultReason} />
        <button type="submit" className={variantClass[variant]} title={label}>
          {icon}
          {label}
        </button>
      </form>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={variantClass[variant]} title={label}>
        {icon}
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            action={action}
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md p-5"
          >
            <h3 className="text-lg font-bold">{label}</h3>
            {presets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReason(p)}
                                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <label className="mt-3 block text-sm font-medium text-slate-700">Reason</label>
            <textarea
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={1}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Explain why this action is being taken…"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {confirmLabel}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
