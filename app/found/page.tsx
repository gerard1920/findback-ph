import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import FoundClient from "@/components/found-page";

export const dynamic = "force-dynamic";

export default function FoundPage() {
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
      <FoundClient />
    </Suspense>
  );
}
