"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastCtx = {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

function uid() {
  return `t_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">): string => {
      const id = uid();
      const entry: Toast = { durationMs: 4500, variant: "info", ...t, id };
      setToasts((prev) => [...prev, entry]);
      if (entry.durationMs && entry.durationMs > 0) {
        window.setTimeout(() => dismiss(id), entry.durationMs);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function ToastViewport() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismiss } = ctx;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:top-auto sm:items-end"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function iconFor(v: ToastVariant) {
  if (v === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (v === "error") return <AlertCircle className="h-5 w-5 text-rose-600" />;
  return <Info className="h-5 w-5 text-indigo-600" />;
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 10);
    return () => window.clearTimeout(t);
  }, []);

  const bg =
    toast.variant === "success"
      ? "border-emerald-200 bg-emerald-50/95"
      : toast.variant === "error"
      ? "border-rose-200 bg-rose-50/95"
      : "border-indigo-200 bg-indigo-50/95";

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm transform transition-all duration-300 ease-out ${
        mounted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 sm:translate-y-2 sm:opacity-0"
      }`}
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ring-1 ring-black/5 ${bg}`}
      >
        <div className="pt-0.5">{iconFor(toast.variant ?? "info")}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
