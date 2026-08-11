import { Suspense } from "react";import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { isAnyEmailConfigured, isDevEmailMode, isSmtpConfigured, isResendTestSender, isResendConfigured } from "@/lib/mail";
import { Spinner } from "@/components/ui/spinner";

export const dynamic = "force-dynamic";

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
        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            🔒 Password reset emails are not sending yet
          </p>
          <p className="text-sm text-blue-800 mb-3">
            To send real password reset links to <strong>any Gmail inbox</strong> (so only the owner can reset their password),
            set up <strong>Resend</strong> — it&apos;s free and takes about 2 minutes.
          </p>
          <ol className="list-decimal pl-5 text-xs text-blue-900 space-y-2">
            <li>
              Go to <a className="font-semibold underline" href="https://resend.com/signup" target="_blank" rel="noreferrer">resend.com/signup</a> and
              sign up free (use your Gmail to sign in, no credit card).
            </li>
            <li>
              On your Resend Dashboard, click <strong>API Keys</strong> in the left menu →
              <strong> Create API Key</strong> → name it anything, choose <em>Full access</em> → copy the key.
            </li>
            <li>
              Paste the key into your <code className="rounded bg-blue-100 px-1 py-0.5 font-mono">.env</code> file:
              <br/>
              <code className="mt-1 inline-block rounded bg-blue-100 px-2 py-1 font-mono text-[11px]">
                RESEND_API_KEY=your_pasted_key_here
              </code>
            </li>
            <li>
              <strong>Add your Gmail as a Single Sender</strong> (to send to any Gmail):
              <ul className="mt-1 list-disc pl-5 space-y-0.5 text-blue-900">
                <li>Left menu → <strong>Senders</strong> → <strong>Add Single Sender</strong></li>
                <li>From Name: <code className="bg-blue-100 px-1 rounded">FindBack PH</code></li>
                <li>From Email Address: <strong>your Gmail</strong> (the one you used to sign up)</li>
                <li>Click <strong>Create sender</strong>, then check your Gmail inbox for the &quot;Verify Sender&quot; email and click the verify link.</li>
              </ul>
            </li>
            <li>
              Finally, in your <code className="rounded bg-blue-100 px-1 py-0.5 font-mono">.env</code>, set:
              <br/>
              <code className="mt-1 inline-block rounded bg-blue-100 px-2 py-1 font-mono text-[11px]">
                RESEND_FROM_EMAIL=&quot;FindBack PH &lt;yourgmail@gmail.com&gt;&quot;
              </code>
              <br/>
              <span className="text-[11px] opacity-80">(replace <code>yourgmail@gmail.com</code> with the Gmail you verified)</span>
            </li>
            <li>Restart your dev server. Reset links will now land in users&apos; actual Gmail inboxes.</li>
          </ol>
        </div>
      )}

      {devMode && anyReady === false && (
        <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-900">
            <strong>⚠️ Insecure Dev Mode is active.</strong> Reset links are shown on the page, which means
            <strong> anyone who knows your email</strong> can reset your password.
            To fix this, configure Resend or SMTP above, then set
            <code className="ml-1 rounded bg-rose-100 px-1 py-0.5 font-mono text-xs">DEV_EMAIL_MODE=false</code> in your <code className="font-mono">.env</code>.
          </p>
        </div>
      )}

      {smtpReady && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">
            <strong>✓ Gmail/SMTP Active.</strong> Reset links are sent to the user&apos;s actual email inbox only.
            Only the person who owns the Gmail inbox can access the link to reset the password.
          </p>
        </div>
      )}

      {resendReady && !resendTestSender && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">
            <strong>✓ Resend Active.</strong> Reset links are sent to the user&apos;s actual Gmail inbox only.
            Only the person who owns the Gmail inbox can access the link to reset the password.
          </p>
        </div>
      )}

      {resendReady && resendTestSender && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Resend Test Sender Active (limited).</strong>
            With <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">onboarding@resend.dev</code>,
            emails are only delivered to <strong>the email on your Resend account</strong> (not any Gmail).
            To send to <strong>ANY Gmail</strong>, add and verify your Gmail as a Single Sender in the Resend dashboard
            (see instructions above when email is &quot;not configured&quot;).
          </p>
        </div>
      )}

      <div className="mt-8">
        <Suspense fallback={<div className="card grid place-items-center p-10"><Spinner size="md" /></div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
