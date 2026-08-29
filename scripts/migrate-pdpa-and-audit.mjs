import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log("Migrating PDPA consent fields and comprehensive Audit Log columns...");

  try {
    await client.query("BEGIN");

    // 1. User PDPA Consent Columns
    await client.query(`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS "consent_pdpa_at" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "consent_pdpa_version" TEXT DEFAULT 'PDPA-TH-2026-V1',
        ADD COLUMN IF NOT EXISTS "medical_consent_given" BOOLEAN DEFAULT true;
    `);

    // 2. Audit Logs Columns
    await client.query(`
      ALTER TABLE "audit_logs"
        ADD COLUMN IF NOT EXISTS "user_name" TEXT,
        ADD COLUMN IF NOT EXISTS "user_role" TEXT DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS "from_state" TEXT,
        ADD COLUMN IF NOT EXISTS "to_state" TEXT,
        ADD COLUMN IF NOT EXISTS "user_agent" TEXT;
    `);

    await client.query("COMMIT");
    console.log("✅ PDPA and Audit Log columns migrated successfully to PostgreSQL!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
