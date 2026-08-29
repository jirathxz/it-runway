import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const events = [
  {
    title: "NPRU Campus Fun Run 2026",
    location: "มหาวิทยาลัยราชภัฏนครปฐม - สนามกีฬากลาง, 85 ถ.มาลัยแมน อ.เมือง จ.นครปฐม",
    date: "2026-03-15 05:30:00+07",
    distance: "5 / 10 KM",
    price: 350,
    status: "open",
  },
  {
    title: "Nakhon Pathom City Run 2026",
    location: "องค์พระปฐมเจดีย์ อ.เมือง จ.นครปฐม",
    date: "2026-03-29 05:00:00+07",
    distance: "5 / 10 / 21 / 42.195 KM",
    price: 650,
    status: "open",
  },
  {
    title: "Kamphaeng Saen ชมพูพันธุ์ทิพย์ มินิมาราธอน",
    location: "ม.เกษตรศาสตร์ วิทยาเขตกำแพงแสน จ.นครปฐม",
    date: "2026-04-05 05:45:00+07",
    distance: "5 / 10.5 / 21 KM",
    price: 600,
    status: "open",
  },
  {
    title: "Phutthamonthon Peace Half Marathon",
    location: "พุทธมณฑลสาย 4 อ.พุทธมณฑล จ.นครปฐม",
    date: "2026-04-19 05:00:00+07",
    distance: "5 / 10 / 21.1 KM",
    price: 650,
    status: "open",
  },
  {
    title: "NPRU Night Run 2026",
    location: "มหาวิทยาลัยราชภัฏนครปฐม - ลานหน้าหอประชุมสิริวรปัญญา, นครปฐม",
    date: "2026-05-02 18:00:00+07",
    distance: "5 / 10 KM",
    price: 450,
    status: "open",
  },
  {
    title: "Samphran Jungle Trail Challenge",
    location: "สวนสามพราน • ริมแม่น้ำท่าจีน อ.สามพราน จ.นครปฐม",
    date: "2026-05-17 05:30:00+07",
    distance: "12 / 25 KM",
    price: 850,
    status: "open",
  },
  {
    title: "Nakhon Chai Si River Cycling & Run",
    location: "ลานวัดกลางบางแก้ว ริมแม่น้ำท่าจีน อ.นครชัยศรี จ.นครปฐม",
    date: "2026-06-07 06:00:00+07",
    distance: "10 / 21 / 40 KM",
    price: 700,
    status: "open",
  },
  {
    title: "NPRU Half Marathon 2026",
    location: "มหาวิทยาลัยราชภัฏนครปฐม - ถนนรอบมหาวิทยาลัย, นครปฐม",
    date: "2026-06-14 05:00:00+07",
    distance: "10 / 21 KM",
    price: 650,
    status: "open",
  },
  {
    title: "Don Tum Farm & Paddy Trail Run",
    location: "ทุ่งบัวแดง • ตลาดน้ำดอนตูม อ.ดอนตูม จ.นครปฐม",
    date: "2026-06-28 05:30:00+07",
    distance: "10 / 18 KM",
    price: 750,
    status: "open",
  },
  {
    title: "Sanam Chandra Palace Heritage Run",
    location: "พระราชวังสนามจันทร์ อ.เมือง จ.นครปฐม",
    date: "2026-07-12 05:15:00+07",
    distance: "3.5 / 10 KM",
    price: 550,
    status: "open",
  },
  {
    title: "Samphran Trail - NPRU Edition",
    location: "มหาวิทยาลัยราชภัฏนครปฐม - สวนป่าและสนามซ้อม, อ.เมือง จ.นครปฐม",
    date: "2026-08-09 06:00:00+07",
    distance: "12 / 25 KM",
    price: 750,
    status: "open",
  },
  {
    title: "Nakhon Pathom Sprint Triathlon 2026",
    location: "ศูนย์กีฬาทางน้ำ มหิดล ศาลายา อ.พุทธมณฑล จ.นครปฐม",
    date: "2026-08-23 06:30:00+07",
    distance: "ว่าย 750m / ปั่น 20K / วิ่ง 5K",
    price: 1450,
    status: "open",
  },
  {
    title: "NPRU Alumni Charity Run",
    location: "มหาวิทยาลัยราชภัฏนครปฐม - อาคารเรียนรวม, 85 ถ.มาลัยแมน จ.นครปฐม",
    date: "2026-09-12 05:30:00+07",
    distance: "5 KM",
    price: 300,
    status: "open",
  },
];

// Fetch Pexels images for seeding
const pexelsKey = process.env.PEXELS_API || process.env.PEXEL_API;
let pexelsPhotos = [];
if (pexelsKey) {
  try {
    const res = await fetch("https://api.pexels.com/v1/search?query=marathon%20thai&per_page=50", {
      headers: { Authorization: pexelsKey },
    });
    const d = await res.json();
    pexelsPhotos = d.photos || [];
  } catch (err) {
    console.warn("Pexels fetch failed:", err);
  }
}

console.log("Seeding events to Neon DB...");
await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS image TEXT;");

for (let i = 0; i < events.length; i++) {
  const e = events[i];
  const photo = pexelsPhotos[i % (pexelsPhotos.length || 1)];
  const imageUrl = photo?.src?.large || photo?.src?.medium || null;

  const existing = await pool.query("SELECT id, image FROM events WHERE title = $1 LIMIT 1", [e.title]);
  if (existing.rows.length > 0) {
    const finalImage = existing.rows[0].image || imageUrl;
    await pool.query(
      `UPDATE events SET location = $1, date = $2, distance = $3, price = $4, status = $5, image = COALESCE(events.image, $6) WHERE id = $7`,
      [e.location, e.date, e.distance, e.price, e.status, imageUrl, existing.rows[0].id]
    );
    console.log("Updated:", e.title);
  } else {
    const res = await pool.query(
      `INSERT INTO events (title, location, date, distance, price, status, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title`,
      [e.title, e.location, e.date, e.distance, e.price, e.status, imageUrl]
    );
    console.log("Inserted:", res.rows[0].title, res.rows[0].id);
  }
}

const count = await pool.query("SELECT count(*) FROM events");
console.log("Total events in Neon DB:", count.rows[0].count);

await pool.end();
