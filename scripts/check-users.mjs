import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Checking database connection and existing users...");
    const res = await client.query('SELECT id, name, email, role, email_verified FROM "user"');
    console.log("Current users in database:", res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
