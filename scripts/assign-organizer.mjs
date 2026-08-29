import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const userId = "XshHk571P1RQJBFnNH0p5L00IgROeH2x";
    
    // Assign Nakhon Pathom City Run 2026 to user-runway
    await client.query(
      `UPDATE events 
       SET organizer_id = $1, organizer_name = 'user-runway', organizer_contact = '081-234-5678', approval_status = 'approved'
       WHERE id = 'fec32c01-1b4e-4605-9cd9-0fe9e0acac94'`,
      [userId]
    );

    // Check registrations for this event
    const regRes = await client.query(
      `SELECT count(*) FROM registrations WHERE event_id = 'fec32c01-1b4e-4605-9cd9-0fe9e0acac94'`
    );
    console.log("Registrations count for Nakhon Pathom City Run:", regRes.rows[0]);

    console.log("✅ Successfully assigned event to user-runway!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
