/**
 * scripts/generate-reset-links.ts
 *
 * Generates single-use password reset links for specific users (typically
 * accounts that were synced from another deployment so they hold temporary
 * bcrypt hashes).  The token UUID is output alongside the signed URL, and
 * only its SHA-256 hash is persisted (matching the same logic used by
 * `sendPasswordReset` in app/actions.ts).
 *
 * Email delivery is disabled on this local/dev environment, so the links are
 * printed to stdout for the operator to copy/paste and deliver manually.
 *
 * Usage:
 *   npx tsx scripts/generate-reset-links.ts potpotsep@gmail.com norainmagtacpao@gmail.com jhazastro@gmail.com
 *   npx tsx scripts/generate-reset-links.ts                     -- defaults to the 3 synced missing users
 */

import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { sha256 } from "@/lib/crypto";

const prisma = new PrismaClient();
const TTL_MS = 1000 * 60 * 60; // 1 hour — matches RESET_TOKEN_TTL_MS in actions.ts

const DEFAULT_RECIPIENTS = [
  "potpotsep@gmail.com",
  "norainmagtacpao@gmail.com",
  "jhazastro@gmail.com",
];

async function generateFor(email: string): Promise<{
  email: string;
  displayName: string;
  username: string;
  link: string;
  token: string;
} | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, displayName: true, username: true },
  });
  if (!user) {
    console.log(`  ⚠️  No user found with email <${email}>`);
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // Atomically invalidate any prior tokens so only the latest link works.
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  const token = randomUUID();
  await prisma.passwordReset.create({
    data: {
      tokenHash: sha256(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });

  return {
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    token,
    link: `${baseUrl}/reset-password?token=${token}`,
  };
}

async function main() {
  const cliEmails = process.argv.slice(2).filter((a) => a.includes("@"));
  const recipients = cliEmails.length > 0 ? cliEmails : DEFAULT_RECIPIENTS;

  console.log("\n=== Password Reset Links for Synced Users ===\n");
  console.log(`Target DB:   ${(prisma as any)._activeProvider ?? "(unknown)"}`);
  console.log(`Base URL:    ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`);
  console.log(`Valid for:   ${TTL_MS / 60000} minutes (1 hour)`);
  console.log(`Hash algo:   SHA-256 of the raw UUID (stored, UUID never persisted)\n`);

  const outputs: Array<NonNullable<Awaited<ReturnType<typeof generateFor>>>> = [];
  for (const email of recipients) {
    const out = await generateFor(email);
    if (out) outputs.push(out);
  }

  if (outputs.length === 0) {
    console.log("No users matched. Nothing to do.\n");
    return;
  }

  console.log("--- Individual Links (copy/paste and email manually) ---\n");
  outputs.forEach((u, i) => {
    console.log(`${i + 1}. ${u.displayName} (@${u.username}) <${u.email}>`);
    console.log(`   🔗 ${u.link}\n`);
  });

  console.log("--- CSV Summary ---\n");
  console.log("displayName,username,email,token,link");
  outputs.forEach((u) => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    console.log(
      [esc(u.displayName), esc(u.username), esc(u.email), esc(u.token), esc(u.link)].join(","),
    );
  });
  console.log("");
  console.log(
    `✅ ${outputs.length} reset link(s) generated.  Previous tokens for these users were invalidated automatically.\n`,
  );
}

main()
  .catch((err) => {
    console.error("❌ Failed to generate reset links:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
