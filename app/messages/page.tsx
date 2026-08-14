"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

type Conversation = {
  id: string;
  item_id: string;
  title: string;
  created_at: string;
  last_message_at: string | null;
  unread_count: number;
};

export default function MessagesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    fetchWithRetry("/api/messages", { credentials: "same-origin", retries: 2 })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setItems(data.data?.conversations ?? []);
        setError(null);
      })
      .catch((e) => {
        if (e instanceof Error && e.name === "AbortError") {
          setError("Connection timed out after multiple attempts. Please check your connection and try again.");
        } else {
          setError("Unable to load messages. Please try again.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return (
    <main className="container-page max-w-4xl py-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <p className="mt-2 text-slate-600">Communicate privately without sharing your phone number or email.</p>
      </div>

            {loading ? (
        <div className="mt-8 flex justify-center">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="mt-7 card flex flex-col items-center justify-center gap-3 p-10 text-center">
          <AlertTriangle size={32} className="text-rose-500" />
                    <h2 className="text-lg font-bold text-slate-900">Couldn&apos;t load messages</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary mt-2 inline-flex items-center gap-1.5"
          >
            Try again
          </button>
        </div>
      ) : items.length ? (
        <div className="mt-7 space-y-3">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="card-hover flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <MessageSquare size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} className="text-slate-400" />
                    {c.last_message_at
                      ? `Last message ${new Date(c.last_message_at).toLocaleString("en-PH")}`
                      : "No messages yet"}
                  </p>
                </div>
              </div>
              {c.unread_count > 0 && (
                <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white ring-1 ring-indigo-200">
                  {c.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card mt-7 flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <MessageSquare size={22} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No conversations yet</h2>
          <p className="text-sm text-slate-600">
            Open an item and contact its reporter to begin.
          </p>
        </div>
      )}
    </main>
  );
}
