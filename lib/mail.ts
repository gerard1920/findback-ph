import { Resend } from "resend";

export interface ResetEmailPayload {
  to: string;
  username: string;
  link: string;
}

export async function sendPasswordResetEmail({ to, username, link }: ResetEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "FindBack PH <no-reply@findback.ph>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(apiKey);

  const response = await resend.emails.send({
    from,
    to,
    subject: "Reset your FindBack PH password",
    html: `
      <p>Hi ${escapeHtml(username)},</p>
      <p>You requested a password reset for your FindBack PH account. Click the link below to choose a new password:</p>
      <p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>
      <p>This link is valid for 1 hour and can be used only once.</p>
      <p>If you didn’t request this reset, you can ignore this email.</p>
      <p>— FindBack PH Team</p>
    `,
  });

  if (response.error) {
    throw new Error(response.error.message ?? "Failed to send password reset email.");
  }

  return response.data;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
