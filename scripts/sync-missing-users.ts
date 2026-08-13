/**
 * sync-missing-users.ts
 *
 * The InfinityFree MySQL / Neon production deployment has 3 registered users
 * that don't exist in the canonical SQLite / local Prisma database:
 *
 *   1. Gerome Gomez Balaoro  @potpotsep4296   potpotsep@gmail.com
 *   2. Nor-ain M. Magtacpao  @norainmagtacpac9906  norainmagtacpao@gmail.com
 *   3. Hey jude              @jhazastro8D35   jhazastro@gmail.com
 *
 * These records were captured from the Owner admin view (which saw 7 users).
 * This script upserts them into whatever database is currently configured by
 * the Prisma datasource.  We cannot recover their original password hashes,
 * so each missing user gets a cryptographically-random temporary password
 * (printed to stdout) — the admin can then click "Send reset link" from the
 * Users table to let the real user regain access.
 *
 * Gerard Balaoro already existed in the local DB but was missing the
 * "Repeated complaints" WARN ban entry that appeared in the live Owner
 * dashboard — we recreate that WARN record as well.
 *
 * Usage:
 *   npx tsx scripts/sync-missing-users.ts
 */

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MissingUserSpec = {
  email: string;
  displayName: string;
  username: string;
  role?: string;
  status?: string;
};

const MISSING_USERS: MissingUserSpec[] = [
  {
    email: "potpotsep@gmail.com",
    displayName: "Gerome Gomez Balaoro",
    username: "potpotsep4296",
    role: "USER",
    status: "ACTIVE",
  },
  {
    email: "norainmagtacpao@gmail.com",
    displayName: "Nor-ain M. Magtacpao",
    username: "norainmagtacpac9906",
    role: "USER",
    status: "ACTIVE",
  },
  {
    email: "jhazastro@gmail.com",
    displayName: "Hey jude",
    username: "jhazastro8D35",
    role: "USER",
    status: "ACTIVE",
  },
];

function generateTempPassword(length = 20): string {
  const bytes = randomBytes(length);
  return bytes.toString("base64url").slice(0, length);
}

async function upsertMissingUser(spec: MissingUserSpec) {
  const tempPassword = generateTempPassword(22);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const existing = await prisma.user.findUnique({
    where: { email: spec.email },
    select: { id: true, email: true, displayName: true, username: true },
  });

  if (existing) {
    console.log(`  ✅ already present: ${spec.displayName} <${spec.email}>`);
    console.log(`     id       = ${existing.id}`);
    console.log(`     username = @${existing.username}`);
    return { user: existing, tempPassword: null as string | null, wasCreated: false };
  }

  const user = await prisma.user.create({
    data: {
      email: spec.email,
      displayName: spec.displayName,
      username: spec.username,
      passwordHash,
      role: spec.role ?? "USER",
      status: spec.status ?? "ACTIVE",
      notifyOnCommentEmail: true,
      notifyOnCommentInApp: true,
      notifyOnClaimEmail: true,
      notifyOnClaimInApp: true,
      notifyOnMessageEmail: true,
      notifyOnMessageInApp: true,
    },
    select: { id: true, email: true, displayName: true, username: true, createdAt: true },
  });

  console.log(`  🆕 created:         ${spec.displayName} <${spec.email}>`);
  console.log(`     id        = ${user.id}`);
  console.log(`     username  = @${user.username}`);
  console.log(`     temp pass = ${tempPassword}`);
  console.log(`     (tell admin to click "Send reset link" so user can regain access)`);

  return { user, tempPassword, wasCreated: true };
}

async function ensureGerardWarning() {
  // balaorogerard20@gmail.com (Gerard Balaoro) has a "WARN: Repeated complaints"
  // entry visible in the Owner dashboard.  Recreate the ban/action record
  // if it doesn't already exist so every admin sees the same data.
  const gerard = await prisma.user.findUnique({
    where: { email: "balaorogerard20@gmail.com" },
    select: { id: true, displayName: true },
  });
  if (!gerard) {
    console.log(`\n  ⚠️  Gerard Balaoro not found — skipping WARN sync.`);
    return;
  }

  const existingWarn = await prisma.ban.findFirst({
    where: { userId: gerard.id, action: "WARN", liftedAt: null },
    select: { id: true },
  });
  if (existingWarn) {
    console.log(`\n  ✅ WARN entry for ${gerard.displayName} already exists.`);
    return;
  }

  const ownerAdmin = await prisma.user.findUnique({
    where: { email: "owner@findback.local" },
    select: { id: true },
  });

  const warn = await prisma.ban.create({
    data: {
      userId: gerard.id,
      adminId: ownerAdmin?.id ?? null,
      action: "WARN",
      reason: "Repeated complaints",
      liftedAt: null,
    },
    select: { id: true, action: true, reason: true },
  });
  console.log(`\n  📝 Created WARN for ${gerard.displayName}: id=${warn.id} reason="${warn.reason}"`);
}

async function main() {
  console.log("\n=== Syncing Missing Users from Live Deployment ===\n");
  console.log(`Target database provider: ${(prisma as any)._activeProvider ?? "(unknown)"}`);
  console.log(`Missing users to sync: ${MISSING_USERS.length}\n`);

  const created = [] as Array<{ displayName: string; tempPassword: string }>;
  for (const spec of MISSING_USERS) {
    const result = await upsertMissingUser(spec);
    if (result.wasCreated && result.tempPassword) {
      created.push({ displayName: spec.displayName, tempPassword: result.tempPassword });
    }
  }

  await ensureGerardWarning();

  const totalUsers = await prisma.user.count();
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  console.log("\n--- Summary ---");
  console.log(`Synced users:   ${MISSING_USERS.length}`);
  console.log(`Newly created:  ${created.length}`);
  console.log(`Already existed:${MISSING_USERS.length - created.length}`);
  console.log(`Total users:    ${totalUsers} (${adminCount} admins)`);
  console.log(`\nAll admins should now see identical ${totalUsers}-user dataset.\n`);
}

main()
  .catch((err) => {
    console.error("❌ User sync failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
