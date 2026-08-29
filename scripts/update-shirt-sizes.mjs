import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // 1. Get all events & registrations
    const regList = await client.query('SELECT id, event_id FROM registrations');
    console.log(`Found ${regList.rows.length} registrations to update.`);

    // Realistic size distribution: S, M, L, XL are more common
    const sizePool = [
      "XS", "S", "S", "M", "M", "M", "L", "L", "L", "L", "XL", "XL", "2XL", "3XL"
    ];
    const distancePool = ["5 KM", "10.5 KM", "21.1 KM", "42.195 KM"];

    for (let i = 0; i < regList.rows.length; i++) {
      const s = sizePool[i % sizePool.length];
      const d = distancePool[i % distancePool.length];
      await client.query(
        'UPDATE registrations SET tshirt_size = $1, distance = $2 WHERE id = $3',
        [s, d, regList.rows[i].id]
      );
    }

    // 2. Ensure all approved events have an organizer assigned so they show in organizer dashboard
    const organizerUser = await client.query(
      `SELECT id, name, email FROM "user" WHERE role = 'admin' OR email = 'user-runway@it-runway.com' LIMIT 1`
    );

    if (organizerUser.rows.length > 0) {
      const orgId = organizerUser.rows[0].id;
      const orgName = organizerUser.rows[0].name || "ผู้จัดงาน IT Runway";
      await client.query(
        `UPDATE events 
         SET organizer_id = $1, organizer_name = $2, approval_status = 'approved' 
         WHERE organizer_id IS NULL`,
        [orgId, orgName]
      );
      console.log(`Assigned unassigned events to ${organizerUser.rows[0].email} (${orgId})`);
    }

    const checkSizes = await client.query(
      `SELECT tshirt_size, count(*) FROM registrations GROUP BY tshirt_size ORDER BY count(*) DESC`
    );
    console.log("Updated T-Shirt Distribution:", checkSizes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
