import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import LostClient from "@/components/lost-page";

export const dynamic = "force-dynamic";

export default function LostPage() {
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
      <LostClient />
    </Suspense>
  );
}
