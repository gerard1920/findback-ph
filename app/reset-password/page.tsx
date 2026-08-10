import { db } from "@/lib/db";
import { isUuid, sha256 } from "@/lib/crypto";
import { ResetForm } from "@/components/reset-password-form";
import { KeyRound } from "lucide-react";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const rawToken = token;
  const now = new Date();

  let isValidLink = false;
  if (isUuid(rawToken)) {
    const row = await db.passwordReset.findFirst({
      where: {
        tokenHash: sha256(rawToken),
        usedAt: null,
        expiresAt: { gte: now },
      },
      select: { id: true },
    });
    isValidLink = !!row;
  }

  if (!isValidLink) {
    return (
      <main className="container-page py-12 max-w-lg">
        <div className="flex items-center gap-3">
          <KeyRound className="h-6 w-6 text-slate-400" />
          <h1 className="text-2xl font-bold">Reset password</h1>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          This password-reset link is invalid or has expired. It may also have already been used.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Please ask a verified admin to generate a new password-reset link for you from the admin
          dashboard (Accounts table → “Send reset link”).
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Note: passwords are stored as bcrypt hashes, so they can never be recovered or displayed.
          Resetting the password is the only way to restore access.
        </p>
      </main>
    );
  }

  return (
    <main className="container-page py-12 max-w-lg">
      <div className="flex items-center gap-3">
        <KeyRound className="h-6 w-6 text-blue-700" />
        <h1 className="text-2xl font-bold">Reset password</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Enter a new password (8–72 characters).
      </p>
      <ResetForm token={rawToken} />
    </main>
  );
}
