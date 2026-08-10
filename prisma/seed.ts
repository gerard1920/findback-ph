import { ItemType, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

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

  const hash = await bcrypt.hash("DemoPass123!", 12);
  const user = await db.user.upsert({
    where: { email: "demo@findback.local" },
    update: {},
    create: {
      email: "demo@findback.local",
      passwordHash: hash,
      displayName: "Demo User (development)",
      username: "findbackdemo",
    },
  });

  const cat = await db.category.findUniqueOrThrow({ where: { name: "Electronics" } });

  if (!(await db.item.count())) {
    await db.item.createMany({
      data: [
        {
          ownerId: user.id,
          categoryId: cat.id,
          type: ItemType.LOST,
          title: "Black iPhone 15",
          brand: "Apple",
          color: "Black",
          description:
            "Black case with a small sticker. Development seed data only.",
          province: "Metro Manila",
          city: "Quezon City",
          approximateLocation: "Near the public transport terminal",
          dateOccurred: new Date(),
        },
        {
          ownerId: user.id,
          categoryId: cat.id,
          type: ItemType.FOUND,
          title: "Black iPhone",
          brand: "Apple",
          color: "Black",
          description: "Found near a public area. Development seed data only.",
          province: "Metro Manila",
          city: "Quezon City",
          approximateLocation: "Near the public transport terminal",
          dateOccurred: new Date(),
        },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
