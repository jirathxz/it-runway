import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log("Migrating multi-channel notification columns...");

  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE "notifications"
        ADD COLUMN IF NOT EXISTS "channel" TEXT DEFAULT 'in_app',
        ADD COLUMN IF NOT EXISTS "recipient" TEXT,
        ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DELIVERED',
        ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS "metadata" TEXT;
    `);

    await client.query("COMMIT");
    console.log("✅ Notifications schema migrated successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
