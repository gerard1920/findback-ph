"use client";
import { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: string; title: string; description?: string; variant?: "error" | "success" | "info"; durationMs?: number };
type ToastContextValue = { toast: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const next = { ...t, id };
    setToasts((prev) => [...prev, next]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.description && <p className="text-xs text-ink-soft">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
