/**
 * One-shot import of local-data-export.json into the PRODUCTION database
 * (the database pointed to by process.env.DATABASE_URL).
 *
 * This is the TARGET side of the local -> production data migration.
 *
 * Run it while the Prisma schema provider is set to "postgresql" and
 * process.env.DATABASE_URL points at the production database:
 *   npx tsx scripts/import-to-production.ts
 *
 * Preserves the original UUIDs wherever possible and remaps foreign keys so
 * all relationships (items -> owner/category, conversations -> item/users,
 * messages -> conversation/sender, notifications -> user) stay valid.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

async function main() {
  const data = JSON.parse(
    readFileSync(join(process.cwd(), "local-data-export.json"), "utf8")
  );

  // ---- 1. Categories (upsert by name, remap ids) ----
  const catMap = new Map<string, string>();
  for (const c of data.category) {
    const existing = await db.category.findUnique({ where: { name: c.name } });
    if (existing) {
      catMap.set(c.id, existing.id);
    } else {
      const created = await db.category.create({
        data: { id: c.id, name: c.name, slug: c.slug },
      });
      catMap.set(c.id, created.id);
      console.log(`category created: ${created.name}`);
    }
  }
  console.log(`categories: ${catMap.size} mapped`);

    // ---- 2. Users (upsert by email, remap ids) ----
  const userMap = new Map<string, string>();
  for (const u of data.user) {
    const { id, email, ...fields } = u;
    try {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        userMap.set(id, existing.id);
      } else {
        const created = await db.user.create({ data: { id, email, ...fields } });
        userMap.set(id, created.id);
        console.log(`user created: ${created.email}`);
      }
    } catch (e) {
      console.log(`user skipped (${u.email}): ${(e as Error).message}`);
    }
  }
  console.log(`users: ${userMap.size} mapped`);

  // ---- 3. Items (preserve id, remap ownerId/categoryId) ----
  for (const it of data.item) {
    try {
      await db.item.create({
        data: {
          ...it,
          ownerId: userMap.get(it.ownerId) ?? it.ownerId,
          categoryId: catMap.get(it.categoryId) ?? it.categoryId,
        },
      });
      console.log(`item created: ${it.title}`);
    } catch (e) {
      console.log(`item skipped (${it.title}): ${(e as Error).message}`);
    }
  }
  console.log(`items: ${data.item.length} attempted`);

  // ---- 4. Conversations (preserve id, remap item/participants) ----
  for (const conv of data.conversation) {
    try {
      await db.conversation.create({
        data: {
          ...conv,
          itemId: conv.itemId, // item id preserved
          participantAId: userMap.get(conv.participantAId) ?? conv.participantAId,
          participantBId: userMap.get(conv.participantBId) ?? conv.participantBId,
        },
      });
      console.log(`conversation created: ${conv.id}`);
    } catch (e) {
      console.log(`conversation skipped: ${(e as Error).message}`);
    }
  }
  console.log(`conversations: ${data.conversation.length} attempted`);

  // ---- 5. Messages (preserve id, remap conversation/sender) ----
  for (const m of data.message) {
    try {
      await db.message.create({
        data: {
          ...m,
          conversationId: m.conversationId,
          senderId: userMap.get(m.senderId) ?? m.senderId,
        },
      });
    } catch (e) {
      console.log(`message skipped: ${(e as Error).message}`);
    }
  }
  console.log(`messages: ${data.message.length} attempted`);

  // ---- 6. Notifications (preserve id, remap userId) ----
  for (const n of data.notification) {
    try {
      await db.notification.create({
        data: { ...n, userId: userMap.get(n.userId) ?? n.userId },
      });
    } catch (e) {
      console.log(`notification skipped: ${(e as Error).message}`);
    }
  }
  console.log(`notifications: ${data.notification.length} attempted`);

  // ---- 7. SavedItems (remap user/item) ----
  for (const s of data.savedItem) {
    try {
      await db.savedItem.create({
        data: {
          userId: userMap.get(s.userId) ?? s.userId,
          itemId: s.itemId,
          createdAt: s.createdAt,
        },
      });
    } catch (e) {
      console.log(`savedItem skipped: ${(e as Error).message}`);
    }
  }
  console.log(`savedItems: ${data.savedItem.length} attempted`);

  console.log("=== IMPORT COMPLETE ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
