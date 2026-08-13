/**
 * List all users (customers and admins) from the database.
 * Run with: npx tsx scripts/list-all-users.ts
 */

import { PrismaClient, Role, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      role: true,
      status: true,
      createdAt: true,
      passwordHash: true,
      phoneNumber: true,
      campus: true,
      preferredProvince: true,
      preferredCity: true,
      _count: { select: { items: true, reportsMade: true, reportsAboutMe: true } },
    },
  });

  console.log("\n=== ALL USERS ===\n");
  console.log(`Total: ${users.length} users\n`);

  const admins = users.filter((u) => u.role === "ADMIN");
  const customers = users.filter((u) => u.role === "USER");

  console.log("--- ADMIN USERS ---");
  if (admins.length === 0) {
    console.log("No admin users found.\n");
  } else {
    admins.forEach((u, i) => {
      console.log(
        `${i + 1}. [${u.id}] ${u.displayName} (@${u.username}) | ${u.email} | Status: ${u.status} | Created: ${u.createdAt.toISOString()}`
      );
    });
    console.log("");
  }

  console.log("--- CUSTOMER USERS ---");
  if (customers.length === 0) {
    console.log("No customer users found.\n");
  } else {
    customers.forEach((u, i) => {
      console.log(
        `${i + 1}. [${u.id}] ${u.displayName} (@${u.username}) | ${u.email} | Status: ${u.status} | Created: ${u.createdAt.toISOString()}`
      );
    });
    console.log("");
  }

  console.log("--- DETAILED VIEW ---");
  users.forEach((u) => {
    console.log(`ID:        ${u.id}`);
    console.log(`Name:      ${u.displayName}`);
    console.log(`Username:  @${u.username}`);
    console.log(`Email:     ${u.email}`);
    console.log(`Role:      ${u.role}`);
    console.log(`Status:    ${u.status}`);
    console.log(`Password:  ${u.passwordHash ? u.passwordHash.substring(0, 30) + "..." : "N/A"}`);
    console.log(`Phone:     ${u.phoneNumber || "N/A"}`);
    console.log(`Campus:    ${u.campus || "N/A"}`);
    console.log(`Province:  ${u.preferredProvince || "N/A"}`);
    console.log(`City:      ${u.preferredCity || "N/A"}`);
    console.log(`Items:     ${u._count.items}`);
    console.log(`Reports:   ${u._count.reportsMade}`);
    console.log(`Created:   ${u.createdAt.toISOString()}`);
    console.log("---");
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
