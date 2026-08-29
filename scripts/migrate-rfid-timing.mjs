import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log("Migrating RFID_READ and RACE_RESULT tables on PostgreSQL...");

  try {
    await client.query("BEGIN");

    // 1. Create rfid_reads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "rfid_reads" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "chip_id" TEXT NOT NULL,
        "bib_id" TEXT NOT NULL,
        "checkpoint_id" UUID REFERENCES "event_checkpoints"("id") ON DELETE CASCADE,
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "detected_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        "reader_id" TEXT NOT NULL DEFAULT 'READER-FINISH-MAT-01',
        "raw_data" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // 2. Enhance race_results table with exact fields
    await client.query(`
      ALTER TABLE "race_results" 
        ADD COLUMN IF NOT EXISTS "finish_time" TEXT DEFAULT '05:54:12 น.',
        ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'FINISHER',
        ADD COLUMN IF NOT EXISTS "age_group_rank" INTEGER DEFAULT 1;
    `);

    await client.query("COMMIT");
    console.log("✅ RFID_READ & RACE_RESULT schema successfully updated on PostgreSQL!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
