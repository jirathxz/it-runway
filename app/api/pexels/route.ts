import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  const key = process.env.PEXELS_API ?? process.env.PEXEL_API;
  if (!key) {
    return NextResponse.json({ photos: [] });
  }

  // สุ่มหน้า 1-3 เพื่อให้ได้ภาพไม่ซ้ำเดิมทุกครั้ง
  const page = Math.floor(Math.random() * 3) + 1;
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=thai%20marathon&per_page=80&page=${page}`,
    {
      headers: { Authorization: key },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Pexels ${res.status}: ${text}` }, { status: 500 });
  }

  const data = await res.json();
  const photos: any[] = data.photos ?? [];

  // สุ่มและเอา 22 ภาพ แบบล้วนๆ thai marathon
  const picked = shuffle(photos).slice(0, 22);

  const items = picked.map((p) => ({
    image: p.src?.medium ?? p.src?.large ?? p.url,
    title: (p.alt as string) || `Thai Marathon #${p.id}`,
    href: p.url,
  }));

  return NextResponse.json({ items, total: photos.length, page });
}
