/**
 * One-shot import of local-data-export.json into the PRODUCTION database
 * (the database pointed to by process.env.DATABASE_URL).
 *
 * Run it while the Prisma schema provider is set to "postgresql" and
 * process.env.DATABASE_URL points at the production database:
 *   npx tsx scripts/import-to-production.ts
 *
 * Preserves original UUIDs and remaps foreign keys so all relationships
 * stay valid. Idempotent: rerunning will not duplicate records.
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

  // ---- 4. ItemImages (preserve id, remap itemId) ----
  if (data.itemImage?.length) {
    for (const img of data.itemImage) {
      try {
        await db.itemImage.create({
          data: {
            ...img,
            itemId: img.itemId,
          },
        });
      } catch (e) {
        console.log(`itemImage skipped: ${(e as Error).message}`);
      }
    }
    console.log(`itemImages: ${data.itemImage.length} attempted`);
  }

  // ---- 5. Conversations (preserve id, remap participants) ----
  for (const conv of data.conversation) {
    try {
      await db.conversation.create({
        data: {
          ...conv,
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

  // ---- 6. Messages (preserve id, remap conversation/sender) ----
  for (const m of data.message) {
    try {
      await db.message.create({
        data: {
          ...m,
          senderId: userMap.get(m.senderId) ?? m.senderId,
        },
      });
    } catch (e) {
      console.log(`message skipped: ${(e as Error).message}`);
    }
  }
  console.log(`messages: ${data.message.length} attempted`);

  // ---- 7. Notifications (preserve id, remap userId) ----
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

  // ---- 8. SavedItems (remap user/item) ----
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

  // ---- 9. Matches (preserve ids) ----
  if (data.match?.length) {
    for (const m of data.match) {
      try {
        await db.match.create({ data: m });
      } catch (e) {
        console.log(`match skipped: ${(e as Error).message}`);
      }
    }
    console.log(`matches: ${data.match.length} attempted`);
  }

  // ---- 10. Claims (remap item/claimant/reviewer) ----
  if (data.claim?.length) {
    for (const c of data.claim) {
      try {
        await db.claim.create({
          data: {
            ...c,
            claimantId: userMap.get(c.claimantId) ?? c.claimantId,
            reviewerId: c.reviewerId ? (userMap.get(c.reviewerId) ?? c.reviewerId) : null,
          },
        });
      } catch (e) {
        console.log(`claim skipped: ${(e as Error).message}`);
      }
    }
    console.log(`claims: ${data.claim.length} attempted`);
  }

  // ---- 11. Reports (remap reporter/reported user/item) ----
  if (data.report?.length) {
    for (const r of data.report) {
      try {
        await db.report.create({
          data: {
            ...r,
            reporterId: userMap.get(r.reporterId) ?? r.reporterId,
            reportedUserId: r.reportedUserId ? (userMap.get(r.reportedUserId) ?? r.reportedUserId) : null,
          },
        });
      } catch (e) {
        console.log(`report skipped: ${(e as Error).message}`);
      }
    }
    console.log(`reports: ${data.report.length} attempted`);
  }

  // ---- 12. Blocks (remap blocker/blocked) ----
  if (data.block?.length) {
    for (const b of data.block) {
      try {
        await db.block.create({
          data: {
            ...b,
            blockerId: userMap.get(b.blockerId) ?? b.blockerId,
            blockedId: userMap.get(b.blockedId) ?? b.blockedId,
          },
        });
      } catch (e) {
        console.log(`block skipped: ${(e as Error).message}`);
      }
    }
    console.log(`blocks: ${data.block.length} attempted`);
  }

  // ---- 13. PasswordResets (remap userId) ----
  if (data.passwordReset?.length) {
    for (const pr of data.passwordReset) {
      try {
        await db.passwordReset.create({
          data: {
            ...pr,
            userId: userMap.get(pr.userId) ?? pr.userId,
          },
        });
      } catch (e) {
        console.log(`passwordReset skipped: ${(e as Error).message}`);
      }
    }
    console.log(`passwordResets: ${data.passwordReset.length} attempted`);
  }

  // ---- 14. Bans (remap user/admin) ----
  if (data.ban?.length) {
    for (const b of data.ban) {
      try {
        await db.ban.create({
          data: {
            ...b,
            userId: userMap.get(b.userId) ?? b.userId,
            adminId: b.adminId ? (userMap.get(b.adminId) ?? b.adminId) : null,
          },
        });
      } catch (e) {
        console.log(`ban skipped: ${(e as Error).message}`);
      }
    }
    console.log(`bans: ${data.ban.length} attempted`);
  }

  // ---- 15. AdminLogs (remap admin) ----
  if (data.adminLog?.length) {
    for (const log of data.adminLog) {
      try {
        await db.adminLog.create({
          data: {
            ...log,
            adminId: log.adminId ? (userMap.get(log.adminId) ?? log.adminId) : null,
          },
        });
      } catch (e) {
        console.log(`adminLog skipped: ${(e as Error).message}`);
      }
    }
    console.log(`adminLogs: ${data.adminLog.length} attempted`);
  }

  console.log("=== IMPORT COMPLETE ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
