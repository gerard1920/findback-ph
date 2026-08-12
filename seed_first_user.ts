import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const db = new PrismaClient();
  const email = "owner@findback.local";
  const password = "FindBack2026!";
  const displayName = "Owner";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", email);
    await db.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      username: email.split("@")[0],
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Created user:");
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${user.role}`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
