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
  if (isDevEmailMode()) {
    return sendViaDevMode(payload);
  }

  if (isSmtpConfigured()) {
    return sendViaSmtp(payload);
  }

  if (isResendConfigured()) {
    return sendViaResend(payload);
  }

  throw new Error(
    "No email provider is configured. Set one of: (1) SMTP_HOST/SMTP_USER/SMTP_PASS for Gmail/SMTP, " +
    "(2) RESEND_API_KEY for Resend, or (3) DEV_EMAIL_MODE=true to show links on the page.",
  );
}

export function shouldExposeResetLink(): boolean {
  return isDevEmailMode() || process.env.NODE_ENV === "development";
}

function buildResetEmailHtml(username: string, link: string): string {
  const safeName = escapeHtml(username);
  const safeLink = escapeHtml(link);
  return `
    <p>Hi ${safeName},</p>
    <p>You requested a password reset for your FindBack PH account. Click the link below to choose a new password:</p>
    <p><a href="${safeLink}">${safeLink}</a></p>
    <p>This link is valid for 1 hour and can be used only once.</p>
    <p>If you didn't request this reset, you can ignore this email.</p>
    <p>— FindBack PH Team</p>
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
