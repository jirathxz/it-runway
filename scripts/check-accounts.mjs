import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, "provider_id", "user_id", password FROM "account" LIMIT 5');
    console.log("Account rows:", res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
