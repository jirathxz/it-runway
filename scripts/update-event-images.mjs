import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const key = process.env.PEXELS_API || process.env.PEXEL_API;
if (!key) {
  console.error("Missing PEXELS_API in environment variables.");
  process.exit(1);
}

async function fetchPexelsMarathonThaiPhotos() {
  console.log("Fetching photos from Pexels with query: 'marathon thai'...");
  const res1 = await fetch(
    "https://api.pexels.com/v1/search?query=marathon%20thai&per_page=50",
    { headers: { Authorization: key } }
  );
  const data1 = await res1.json();
  const photos1 = data1.photos || [];

  const res2 = await fetch(
    "https://api.pexels.com/v1/search?query=thai%20marathon&per_page=50",
    { headers: { Authorization: key } }
  );
  const data2 = await res2.json();
  const photos2 = data2.photos || [];

  // Combine and deduplicate by photo id
  const allPhotosMap = new Map();
  [...photos1, ...photos2].forEach((p) => {
    if (!allPhotosMap.has(p.id)) {
      allPhotosMap.set(p.id, p);
    }
  });

  const uniquePhotos = Array.from(allPhotosMap.values());
  console.log(`Found ${uniquePhotos.length} unique Pexels photos for 'marathon thai'`);
  return uniquePhotos;
}

async function run() {
  // 1. Ensure column exists in Neon DB
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS image TEXT;");
  console.log("Verified 'image' column in 'events' table.");

  // 2. Fetch Pexels photos
  const pexelsPhotos = await fetchPexelsMarathonThaiPhotos();
  if (pexelsPhotos.length === 0) {
    console.error("No photos returned from Pexels API.");
    process.exit(1);
  }

  // 3. Fetch all events from DB
  const eventsRes = await pool.query("SELECT id, title, location, distance FROM events ORDER BY date ASC");
  const events = eventsRes.rows;
  console.log(`Found ${events.length} events in Neon DB.`);

  // 4. Assign unique image to each event (no duplicates)
  const usedPhotoIds = new Set();

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    
    // Pick photo that hasn't been used yet
    const availablePhoto = pexelsPhotos.find((p) => !usedPhotoIds.has(p.id)) || pexelsPhotos[i % pexelsPhotos.length];
    usedPhotoIds.add(availablePhoto.id);

    const imageUrl = availablePhoto.src.large || availablePhoto.src.medium || availablePhoto.src.original;

    await pool.query("UPDATE events SET image = $1 WHERE id = $2", [imageUrl, ev.id]);
    console.log(`[${i + 1}/${events.length}] Updated "${ev.title}":`);
    console.log(`  -> Pexels Photo ID ${availablePhoto.id}: ${imageUrl}\n`);
  }

  // 5. Verify all events have distinct images
  const verifyRes = await pool.query("SELECT id, title, image FROM events ORDER BY date ASC");
  const images = verifyRes.rows.map((r) => r.image);
  const uniqueImages = new Set(images);

  console.log("=========================================");
  console.log(`Total events updated: ${verifyRes.rows.length}`);
  console.log(`Unique images count: ${uniqueImages.size}`);
  console.log("No duplicates check:", uniqueImages.size === verifyRes.rows.length ? "PASSED (100% Unique)" : "WARNING (Some duplicates)");
  console.log("=========================================");

  await pool.end();
}

run().catch((err) => {
  console.error("Error updating event images:", err);
  process.exit(1);
});
