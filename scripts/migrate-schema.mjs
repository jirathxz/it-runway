import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log("Running migration for Organizer, Approval, and Check-In features...");

  const client = await pool.connect();
  try {
    // Add columns to events table if not exist
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS organizer_id TEXT,
      ADD COLUMN IF NOT EXISTS organizer_name TEXT,
      ADD COLUMN IF NOT EXISTS organizer_contact TEXT,
      ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved';
    `);

    // Add columns to registrations table if not exist
    await client.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS checked_in TEXT NOT NULL DEFAULT 'no',
      ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
