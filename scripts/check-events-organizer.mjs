import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const eventsRes = await client.query('SELECT id, title, organizer_id, organizer_name, approval_status FROM events LIMIT 10');
    console.log("Events:", eventsRes.rows);

    const userRunway = await client.query('SELECT id, name, email, role FROM "user" WHERE email = $1', ['user-runway@it-runway.com']);
    console.log("user-runway user:", userRunway.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
