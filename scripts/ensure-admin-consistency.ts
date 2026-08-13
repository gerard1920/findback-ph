/**
 * ensure-admin-consistency.ts
 *
 * Scans every ADMIN account in the database and guarantees they all have the
 * exact same standardized set of fields (status + 6x notification prefs).
 * This is the same normalization that runs automatically inside `requireAdmin()`
 * on every admin page/API call, but this script can be invoked from the CLI
 * so the operator can fix admin records before any admin logs in.
 *
 * Usage:
 *   npx tsx scripts/ensure-admin-consistency.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  STANDARD_ADMIN_DEFAULTS,
  computeAdminNormalization,
} from "@/lib/admin";

const prisma = new PrismaClient();

type AdminRow = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  role: string;
  status: string;
  notifyOnCommentEmail: boolean;
  notifyOnCommentInApp: boolean;
  notifyOnClaimEmail: boolean;
  notifyOnClaimInApp: boolean;
  notifyOnMessageEmail: boolean;
  notifyOnMessageInApp: boolean;
};

async function main() {
  console.log("\n=== Admin Account Consistency Check ===\n");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      role: true,
      status: true,
      notifyOnCommentEmail: true,
      notifyOnCommentInApp: true,
      notifyOnClaimEmail: true,
      notifyOnClaimInApp: true,
      notifyOnMessageEmail: true,
      notifyOnMessageInApp: true,
    },
  });

  if (admins.length === 0) {
    console.log("No ADMIN accounts found in the database.");
    console.log("Run `npx tsx seed_first_user.ts` to create the Owner admin, or");
    console.log("run `npm run db:seed` to seed the standard FindBack Admin.\n");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${admins.length} admin account(s).\n`);
  console.log(`Standard admin defaults:`);
  console.log(`  role:     ${STANDARD_ADMIN_DEFAULTS.role}`);
  console.log(`  status:   ${STANDARD_ADMIN_DEFAULTS.status}`);
  console.log(`  notif prefs: all 6 = true\n`);

  let fixed = 0;
  const results: Array<{ admin: AdminRow; changes: Record<string, unknown> | null }> = [];

  for (const admin of admins as AdminRow[]) {
    const patch = computeAdminNormalization(admin);
    if (patch) {
      await prisma.user.update({ where: { id: admin.id }, data: patch });
      fixed++;
    }
    results.push({ admin, changes: patch });
  }

  console.log("--- Detailed Results ---");
  results.forEach(({ admin, changes }, i) => {
    console.log(`\n${i + 1}. ${admin.displayName} (@${admin.username}) <${admin.email}>`);
    console.log(`   id:        ${admin.id}`);
    console.log(`   status:    ${admin.status}`);
    if (!changes) {
      console.log(`   ✓ already consistent (no changes needed)`);
    } else {
      console.log(`   🔧 normalized fields:`);
      for (const [key, value] of Object.entries(changes)) {
        console.log(`      - ${key}: ${JSON.stringify(value)}`);
      }
    }
  });

  console.log(`\n--- Summary ---`);
  console.log(`Total admins:    ${admins.length}`);
  console.log(`Normalized:      ${fixed}`);
  console.log(`Already ok:      ${admins.length - fixed}`);
  console.log(`Admins now ALL have identical field structure.\n`);
}

main()
  .catch((err) => {
    console.error("❌ Admin consistency check failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
