import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface ResetEmailPayload {
  to: string;
  username: string;
  link: string;
}

export interface SendEmailResult {
  provider: string;
  id?: string;
  previewLink?: string;
  devMode?: boolean;
}

function envValue(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export function isResendConfigured(): boolean {
  return Boolean(envValue("RESEND_API_KEY"));
}

export function isSmtpConfigured(): boolean {
  return Boolean(envValue("SMTP_HOST") && envValue("SMTP_USER") && envValue("SMTP_PASS"));
}

export function isDevEmailMode(): boolean {
  return envValue("DEV_EMAIL_MODE").toLowerCase() === "true";
}

export function isAnyEmailConfigured(): boolean {
  return isResendConfigured() || isSmtpConfigured() || isDevEmailMode();
}

export function canSendEmail(): boolean {
  return isAnyEmailConfigured();
}

export async function sendGenericEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = envValue("RESEND_API_KEY");
  if (apiKey) {
    const from = envValue("RESEND_FROM_EMAIL") || "FindBack PH <onboarding@resend.dev>";
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({ from, to: to.trim().toLowerCase(), subject, html });
    if (response.error) throw new Error(response.error.message || "Failed to send email.");
    return;
  }

  const host = envValue("SMTP_HOST");
  const port = parseInt(envValue("SMTP_PORT") || "587", 10);
  const user = envValue("SMTP_USER");
  const pass = envValue("SMTP_PASS");
  const secure = envValue("SMTP_SECURE").toLowerCase() === "true";
  const from = envValue("SMTP_FROM_EMAIL") || envValue("SMTP_USER");
  if (!host || !user || !pass) throw new Error("SMTP is not configured.");
  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  await transporter.sendMail({ from, to: to.trim().toLowerCase(), subject, html });
}

export function isResendTestSender(): boolean {
  const from = envValue("RESEND_FROM_EMAIL").toLowerCase();
  return !from || from.includes("@resend.dev");
}

function formatResendError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("only send") ||
    lower.includes("testing emails") ||
    lower.includes("verify a domain")
  ) {
    return (
      "Resend test sender limitation. Use SMTP (Gmail) instead, or set DEV_EMAIL_MODE=true in .env " +
      "to display reset links directly on the page for testing."
    );
  }
  if (lower.includes("domain is not verified") || lower.includes("not verified")) {
    return (
      "The sender address is not verified in Resend. Try using SMTP (Gmail) instead, " +
      'or set DEV_EMAIL_MODE=true in .env for local testing.'
    );
  }
  return message;
}

function _getFromAddress(): string {
  return (
    envValue("SMTP_FROM_EMAIL") ||
    envValue("RESEND_FROM_EMAIL") ||
    "FindBack PH <noreply@findback.ph>"
  );
}

async function sendViaResend({ to, username, link }: ResetEmailPayload): Promise<SendEmailResult> {
  const apiKey = envValue("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const from = envValue("RESEND_FROM_EMAIL") || "FindBack PH <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const response = await resend.emails.send({
    from,
    to: to.trim().toLowerCase(),
    subject: "Reset your FindBack PH password",
    html: buildResetEmailHtml(username, link),
  });

  if (response.error) {
    throw new Error(formatResendError(response.error.message ?? "Failed to send password reset email."));
  }

  return { provider: "resend", id: response.data?.id ?? undefined };
}

async function sendViaSmtp({ to, username, link }: ResetEmailPayload): Promise<SendEmailResult> {
  const host = envValue("SMTP_HOST");
  const port = parseInt(envValue("SMTP_PORT") || "587", 10);
  const user = envValue("SMTP_USER");
  const pass = envValue("SMTP_PASS");
  const secure = envValue("SMTP_SECURE").toLowerCase() === "true";
  const from = envValue("SMTP_FROM_EMAIL") || envValue("SMTP_USER");

  if (!host || !user || !pass) {
    throw new Error("SMTP is not fully configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: to.trim().toLowerCase(),
    subject: "Reset your FindBack PH password",
    html: buildResetEmailHtml(username, link),
  });

  return { provider: "smtp" };
}

async function sendViaDevMode({ to, username, link }: ResetEmailPayload): Promise<SendEmailResult> {
  console.log("\n========== DEV EMAIL MODE ==========");
  console.log(`To: ${to}`);
  console.log(`User: ${username}`);
  console.log(`Reset Link: ${link}`);
  console.log("====================================\n");
  return { provider: "dev", devMode: true };
}

export async function sendPasswordResetEmail(payload: ResetEmailPayload): Promise<SendEmailResult> {
  if (isResendConfigured()) {
    return sendViaResend(payload);
  }

  if (isSmtpConfigured()) {
    return sendViaSmtp(payload);
  }

  if (isDevEmailMode()) {
    return sendViaDevMode(payload);
  }

  throw new Error(
    "No email provider is configured. Set one of: (1) RESEND_API_KEY for Resend (recommended, free, works with any Gmail), " +
    "(2) SMTP_HOST/SMTP_USER/SMTP_PASS for Gmail/SMTP, or (3) DEV_EMAIL_MODE=true for local testing (console-only, NOT shown on UI).",
  );
}

export function shouldExposeResetLink(): boolean {
  return isDevEmailMode();
}

function buildResetEmailHtml(username: string, link: string): string {
  const safeName = escapeHtml(username);
  const safeLink = escapeHtml(link);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FindBack PH</h1>
              <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">Lost & Found Community Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${safeName}</strong>,<br><br>
                We received a request to reset your password for your FindBack PH account. Click the button below to choose a new password.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 32px;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="${safeLink}" 
                       style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                      Reset Your Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fallback Link -->
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; color: #2563eb; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                ${safeLink}
              </p>
              
              <!-- Expiration Notice -->
              <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; text-align: left;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                  <strong style="color: #78350f;">⏱️ This link expires in 15 minutes.</strong><br>
                  For security reasons, this password reset link can only be used once. If you need a new link, please request another password reset.
                </p>
              </div>
              
              <!-- Security Notice -->
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #e5e7eb;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px;">
                <strong style="color: #1f2937;">FindBack PH</strong> — Connecting communities to recover lost items
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                Philippines' trusted lost and found platform<br>
                Questions? Contact us at <a href="mailto:support@findback.ph" style="color: #2563eb; text-decoration: none;">support@findback.ph</a>
              </p>
              <p style="margin: 16px 0 0; color: #d1d5db; font-size: 10px;">
                © ${new Date().getFullYear()} FindBack PH. All rights reserved.<br>
                This email was sent to ${safeName}@example.com
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
