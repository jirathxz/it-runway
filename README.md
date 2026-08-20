# IT-Runway

เว็บปฏิทินงานวิ่ง + ระบบสมัครงานวิ่งทั่วไทย (มาราธอน เทรล ฟันรัน) — พอร์ตจากเว็บ static ต้นฉบับ (`../js/db.js` + `../templates/`) มาสู่ Next.js App Router + Tailwind v4 + TypeScript.

หน้าแรกแบ่งหมวด: **hero** (carousel), **รายการวิ่งเปิดใหม่ (new)**, **ยอดนิยม (popular)**, **แนะนำเลย (recommend)**, **อื่น ๆ (others)** และ **งานที่เปิดรับสมัคร (register)** — section ที่ว่างจะถูกซ่อนอัตโนมัติ

## Stack

| ส่วน | เทคโนโลยี |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 — สไตล์ทั้งหมดใน `app/globals.css` (ไม่ใช้ utility class) |
| Backend | Supabase (Postgres + REST API ผ่าน `@supabase/supabase-js`) |
| Package manager | pnpm (มองเห็นเวอร์ชันได้จาก `package.json#packageManager`) |
| Deploy | Vercel — https://it-runway.vercel.app |

## โครงสร้าง

```
app/            หน้าเว็บ (/, /events/[id], /organizer)
components/     UI ต่าง ๆ (Carousel, EventCards, …)
lib/            data.ts (อ่านจาก Supabase, fallback seed.json)
scripts/        build-seed.mjs (สร้าง seed จากข้อมูลต้นทาง)
supabase/       schema.sql, seed.sql, setup.sql, seed.json
```

## เริ่มใช้งาน (dev)

```bash
pnpm install
pnpm dev
```

## ข้อมูลและกระบวนการ fill ข้อมูล (Data model)

1. **ข้อมูลต้นทาง** อยู่ใน `../js/db.js` (โฟลเดอร์แม่ — source of truth).
2. `scripts/build-seed.mjs` อ่านมันและสร้าง:
   - `supabase/seed.json` — fallback ของแอป (กรณีไม่มี env)
   - `supabase/seed.sql` — SQL insert ให้ Supabase
   - `supabase/setup.sql` — schema + seed รวม (ไฟล์เดียวสำหรับ SQL Editor)
3. `lib/data.ts` อ่านจาก **Supabase** ถ้า `.env.local` มี credentials, ไม่งั้นใช้ `seed.json` ในตัว

### สร้าง seed ใหม่หลังแก้ `js/db.js`

```bash
node scripts/build-seed.mjs
```

ทำ seed ให้เหลือเฉพาะบางอีเวนต์ (เช่น เหลือ 5 event):

```powershell
$env:SEED_ONLY = "run-0102,run-0103,run-0305,run-0501,run-0001"
node scripts/build-seed.mjs
```

โหมด SEED_ONLY จะ **ลบแถวในตาราง `events` ทั้งหมดก่อน** (`DELETE FROM public.events;`) แล้ว insert เฉพาะที่ระบุ — รวมถึงจัดการ id ซ้ำกับแถวเก่า (PK conflict) ให้แถว `run-XXXX` เดิมถูก promote เป็นหมวดใหม่แทนการถูกข้าม

## Supabase setup

1. สร้างโปรเจกต์ใน Supabase dashboard
2. ใน **SQL Editor**: วาง `supabase/setup.sql` ทั้งไฟล์แล้ว Run
3. คัดลอก `.env.local.example` → `.env.local` แล้วกรอก:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key (public — ฝั่ง client ใช้ได้ตามปกติ)

> `NEXT_PUBLIC_*` เป็นค่า public (ถูก bundle ลง client) — ห้ามใส่ service_role key ลงใน env ที่ deploy

## Deployment (Vercel)

Vercel ตรวจจับ pnpm จาก `pnpm-lock.yaml` และรัน `pnpm install` ให้อัตโนมัติ เช่นเดียวกับ `pnpm run build`.

```bash
vercel login            # ครั้งแรก
vercel link             # ผูกโปรเจกต์
vercel deploy --prod    # deploy production
```

- โดเมน production: https://it-runway.vercel.app
- ต้องตั้ง env ใน Vercel dashboard (Settings → Environment Variables): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- หลังเปลี่ยนชื่อโปรเจกต์โดเมน `*.vercel.app` เดิมอาจไม่ migrate ให้เอง — ใช้ `vercel alias set <url> <domain>` หรือเพิ่มใน dashboard

## หมายเหตุ

- Tailwind v4 ใช้เป็น entry ของ CSS framework เท่านั้น; ลาย/การจัดวางอยู่ที่ `app/globals.css` (mirror `../css/style.css`)
- ฟอนต์โหลดจาก Google Fonts CDN (mirror เว็บ static) — lint exception `@next/next/no-page-custom-font` ใน `app/layout.tsx` ตั้งใจไว้
- ไฟล์ SQL เป็น UTF-8 **ไม่มี BOM** (ภาษาไทยจะเพี้ยนถ้าบันทึกเป็น BOM/ANSI)
- รัน production server จาก PowerShell: `cmd /c pnpm start` (`pnpm` shim ล้มเหลวภายใต้ `Start-Process`)