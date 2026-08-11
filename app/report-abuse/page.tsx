import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import ReportAbuseClient from "@/components/report-abuse-page";

export const dynamic = "force-dynamic";

export default function ReportAbusePage() {
  return (
    <Suspense
      fallback={
        <main className="container-page py-10">
          <div className="card grid place-items-center p-10">
            <Spinner size="md" />
          </div>
        </main>
      }
    >
      <ReportAbuseClient />
    </Suspense>
  );
}
