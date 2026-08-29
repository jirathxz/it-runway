import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log("Migrating Event Lifecycle, Categories Hierarchy, Registrations Status, and BIB_TRANSFERS History...");

  try {
    await client.query("BEGIN");

    // 1. Events lifecycle columns
    await client.query(`
      ALTER TABLE "events"
        ADD COLUMN IF NOT EXISTS "event_status" TEXT DEFAULT 'REGISTRATION_OPEN',
        ADD COLUMN IF NOT EXISTS "age_calculation_method" TEXT DEFAULT 'RACE_DAY';
    `);

    // 2. Event categories hierarchy columns
    await client.query(`
      ALTER TABLE "event_categories"
        ADD COLUMN IF NOT EXISTS "bib_prefix" TEXT DEFAULT 'HM',
        ADD COLUMN IF NOT EXISTS "bib_start_number" INTEGER DEFAULT 1001,
        ADD COLUMN IF NOT EXISTS "bib_end_number" INTEGER DEFAULT 1999,
        ADD COLUMN IF NOT EXISTS "allowed_age_groups" TEXT DEFAULT '["18-29", "30-39", "40-49", "50-59", "60+"]',
        ADD COLUMN IF NOT EXISTS "gender_options" TEXT DEFAULT '["male", "female"]',
        ADD COLUMN IF NOT EXISTS "tshirt_design_url" TEXT;
    `);

    // 3. Registrations status & age group columns
    await client.query(`
      ALTER TABLE "registrations"
        ADD COLUMN IF NOT EXISTS "registration_status" TEXT DEFAULT 'UPCOMING',
        ADD COLUMN IF NOT EXISTS "age_group" TEXT DEFAULT '30-39';
    `);

    // 4. Create bib_transfers table with exact requested fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bib_transfers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "from_user_id" TEXT NOT NULL REFERENCES "user"("id"),
        "to_user_id" TEXT REFERENCES "user"("id"),
        "old_bib" TEXT NOT NULL,
        "new_bib" TEXT NOT NULL,
        "old_chip" TEXT NOT NULL,
        "new_chip" TEXT NOT NULL,
        "reason" TEXT,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        "completed_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await client.query("COMMIT");
    console.log("✅ Event Lifecycle, Hierarchy, and BIB_TRANSFER History schema migrated successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
