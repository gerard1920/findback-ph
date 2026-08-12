/**
 * One-shot export of the LOCAL SQLite database into a portable JSON file.
 * This is the SOURCE side of the local -> production data migration.
 *
 * Run this while the Prisma schema provider is set to "sqlite" (local dev).
 *   npx tsx scripts/export-local-data.ts
 *
 * Output: local-data-export.json (gitignored).
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

// Export all tables that carry application data.
const MODELS = [
  "category",
  "user",
  "item",
  "itemImage",
  "conversation",
  "message",
  "notification",
  "savedItem",
  "match",
  "claim",
  "report",
  "block",
  "passwordReset",
  "ban",
  "adminLog",
] as const;

async function main() {
  const data: Record<string, unknown[]> = {};
  for (const m of MODELS) {
    const rows = await (db as any)[m].findMany();
    data[m] = rows;
    console.log(`${m}: ${rows.length}`);
  }
  const outPath = join(process.cwd(), "local-data-export.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
