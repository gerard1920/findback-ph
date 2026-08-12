import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Idempotently seeds only the required item categories.
// NOTE: Deliberately does NOT create demo/admin user accounts.
// User accounts with known passwords must never be seeded into production.
async function main() {
  const names = [
    "Electronics",
    "Wallets",
    "IDs & Documents",
    "Bags",
    "Keys",
    "Jewelry",
    "Vehicle Items",
    "School Items",
    "Other",
  ];

  for (const name of names) {
    await db.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z]+/g, "-")
          .replace(/-$/, ""),
      },
    });
  }

  const count = await db.category.count();
  console.log(`Seed: ensured ${count} categories (no user accounts created).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
