import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
const content = readFileSync(schemaPath, "utf8");
const dbUrl = process.env.DATABASE_URL || "";

const isProductionDb = /^postgres(ql)?:\/\//i.test(dbUrl);

if (isProductionDb) {
  const updated = content.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  if (updated !== content) {
    writeFileSync(schemaPath, updated, "utf8");
    console.log("Switched Prisma schema to PostgreSQL for production build.");
  } else {
    console.log("Schema already set to PostgreSQL.");
  }
} else {
  const updated = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  if (updated !== content) {
    writeFileSync(schemaPath, updated, "utf8");
    console.log("Switched Prisma schema to SQLite for local development.");
  } else {
    console.log("Schema already set to SQLite.");
  }
}
