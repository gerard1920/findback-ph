import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { EnhancedReportForm } from "@/components/enhanced-report-form";

export default async function ReportTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const normalized = type?.toLowerCase();
  if (normalized !== "lost" && normalized !== "found") redirect("/report");
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/report/${normalized}`)}`);

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="container-page max-w-4xl py-10">
      <div className="mb-2 inline-flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
            normalized === "lost"
              ? "bg-rose-50 text-rose-700 ring-rose-200"
              : "bg-blue-50 text-blue-700 ring-blue-200"
          }`}
        >
          {normalized === "lost" ? "🔴 REPORTING LOST" : "🔵 REPORTING FOUND"}
        </span>
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Report an item you {normalized === "lost" ? "Lost" : "Found"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
        {normalized === "lost"
          ? "Share the details of the item you lost. The more descriptive your report, the better chance someone recognizes it and can help you recover it."
          : "Describe the item you found accurately but keep identifying details private — only the rightful owner should be able to prove ownership."}
        Public information (title, description, location, photos) is shown publicly. Private fields (serial #, marks) are used only for ownership verification.
      </p>
      <EnhancedReportForm type={normalized.toUpperCase() as "LOST" | "FOUND"} categories={categories} />
    </main>
  );
}
