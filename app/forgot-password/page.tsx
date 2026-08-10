import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { isAnyEmailConfigured, isDevEmailMode, isSmtpConfigured, isResendTestSender, isResendConfigured } from "@/lib/mail";

export default function ForgotPassword() {
  const anyReady = isAnyEmailConfigured();
  const devMode = isDevEmailMode();
  const smtpReady = isSmtpConfigured();
  const resendReady = isResendConfigured();
  const resendTestSender = isResendTestSender();

  return (
    <main className="container-page py-12 max-w-lg">
      <h1 className="text-center text-3xl font-bold">Forgot password?</h1>
      <p className="mt-2 text-center text-slate-600">
        Enter the email address associated with your account and we&apos;ll send you a link to reset
        your password.
      </p>

      {!anyReady && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Email service not configured.</strong> Password reset emails cannot be sent.
            Set one of the following in your <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">.env</code> file:
          </p>
          <ul className="mt-2 list-disc pl-5 text-xs text-amber-800 space-y-1">
            <li><code className="font-mono">DEV_EMAIL_MODE=true</code> — Show reset links on the page (recommended for local testing)</li>
            <li><code className="font-mono">SMTP_HOST / SMTP_USER / SMTP_PASS</code> — Use Gmail or any SMTP server (can send to any email)</li>
            <li><code className="font-mono">RESEND_API_KEY</code> — Use Resend service</li>
          </ul>
        </div>
      )}

      {devMode && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">
            <strong>✓ Direct Mode Active.</strong> After you enter your email and click <strong>&quot;Send reset link&quot;</strong>,
            you will be <strong>taken DIRECTLY to the password reset page</strong> — no email needed, no clicking links.
            Works with <em>any</em> email address of a registered account (including any Gmail).
          </p>
        </div>
      )}

      {!devMode && smtpReady && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">
            <strong>✓ Gmail/SMTP Active.</strong> Emails will be sent to <strong>any email address</strong> including Gmail, Yahoo, Outlook, etc.
          </p>
        </div>
      )}

      {!devMode && !smtpReady && resendReady && resendTestSender && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Resend Test Mode.</strong> With <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">onboarding@resend.dev</code>
            , emails only go to your Resend account email.
            For sending to <strong>any Gmail</strong>, set <code className="font-mono">DEV_EMAIL_MODE=true</code> for local testing
            or configure Gmail/SMTP using <code className="font-mono">SMTP_HOST</code> / <code className="font-mono">SMTP_USER</code> / <code className="font-mono">SMTP_PASS</code>.
          </p>
        </div>
      )}

      <ForgotPasswordForm isResendConfigured={anyReady} />
    </main>
  );
}
