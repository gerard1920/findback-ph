import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

const schemaPath = join(__dirname, "..", "prisma", "schema.prisma");
const originalContent = readFileSync(schemaPath, "utf8");
const dbUrl = process.env.DATABASE_URL || "";

const isProductionDb = /^postgres(ql)?:\/\//i.test(dbUrl);

if (isProductionDb) {
  const updated = originalContent.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  if (updated !== originalContent) {
    writeFileSync(schemaPath, updated, "utf8");
    console.log("Switched Prisma schema to PostgreSQL for production build.");
  } else {
    console.log("Schema already set to PostgreSQL.");
  }
} else {
  const updated = originalContent.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  if (updated !== originalContent) {
    writeFileSync(schemaPath, updated, "utf8");
    console.log("Switched Prisma schema to SQLite for local development.");
  } else {
    console.log("Schema already set to SQLite.");
  }
}

process.on("exit", () => {
  try {
    writeFileSync(schemaPath, originalContent, "utf8");
    console.log("Restored original Prisma schema provider.");
  } catch {
    // ignore restore errors
  }
});
