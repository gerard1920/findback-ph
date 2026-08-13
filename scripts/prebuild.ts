import { execSync } from "child_process";
import { isDatabaseAvailable } from "@/lib/db";

function run(command: string, label: string) {
  console.log(`\n>>> ${label}`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`\n[prebuild] ${label} failed:`, error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("=== FindBack PH Prebuild ===\n");
  console.log("NOTE: Ensure DATABASE_URL is set to your Supabase PostgreSQL connection string for shared localhost + Vercel access.");

  run("tsx scripts/setup-db-provider.ts", "Setup DB provider");
  run("prisma generate", "Generate Prisma Client");

  const dbOk = await isDatabaseAvailable();
  if (dbOk) {
    run("prisma db push", "Push schema to database");
    run("tsx scripts/seed-categories.ts", "Seed categories");
    run("tsx prisma/seed.ts", "Seed users");
    run("tsx scripts/ensure-admin-consistency.ts", "Ensure admin consistency");
  } else {
    console.log("\n[prebuild] Database not reachable — skipping db push and seeds.");
    console.log("[prebuild] Configure DATABASE_URL in .env to enable database operations.\n");
  }
}

main().catch((err) => {
  console.error("[prebuild] Fatal error:", err);
  process.exit(1);
});
