const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.kdkruhjcvrahtpwtseis:asd2asd2balaoro@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
  });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log("Tables:", result.rows.map((row) => row.table_name).join(", "));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
