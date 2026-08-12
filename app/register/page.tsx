import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function Register() {
  return (
    <main className="container-page py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Create your account</h1>
          <p className="mt-2 text-slate-600">Join your community&apos;s lost and found network.</p>
        </div>
        <div className="mt-8">
          <Suspense fallback={<div className="card grid place-items-center p-10"><Spinner size="md" /></div>}>
            <AuthForm initialMode="register" />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-indigo-700 underline hover:text-indigo-900" href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
