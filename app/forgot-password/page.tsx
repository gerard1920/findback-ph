import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPassword() {
  const isResendConfigured = Boolean(process.env.RESEND_API_KEY?.trim());

  return (
    <main className="container-page py-12 max-w-lg">
      <h1 className="text-center text-3xl font-bold">Forgot password?</h1>
      <p className="mt-2 text-center text-slate-600">
        Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
      </p>
      {!isResendConfigured && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Email service not configured.</strong> Password reset emails cannot be sent until the{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">RESEND_API_KEY</code> environment
            variable is set. Please contact support or check the server configuration.
          </p>
        </div>
      )}
      <ForgotPasswordForm isResendConfigured={isResendConfigured} />
    </main>
  );
}
