import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { STANDARD_ADMIN_DEFAULTS } from "@/lib/admin";

async function main() {
  const db = new PrismaClient();
  const email = "owner@findback.local";
  const password = "FindBack2026!";
  const displayName = "Owner";

  // Always upsert — if the admin already exists, normalize it against the
  // standard admin defaults so every admin record has identical fields.
  const passwordHash = await bcrypt.hash(password, 12);
  const adminData = {
    email,
    passwordHash,
    displayName,
    username: email.split("@")[0],
    ...STANDARD_ADMIN_DEFAULTS,
  } as const;

  const user = await db.user.upsert({
    where: { email },
    update: { ...adminData },
    create: { ...adminData },
    select: { id: true, email: true, role: true },
  });

  console.log("Admin account ready (standardized):");
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${user.role}`);
  console.log(`Normalized fields: role, status, 6x notification prefs`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
