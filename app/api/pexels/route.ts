import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache for 24 hours on Vercel CDN

const curatedMarathonImages = [
  { image: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Thai Marathon Dawn" },
  { image: "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Nakhon Pathom Road" },
  { image: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Trail Run" },
  { image: "https://images.pexels.com/photos/2774140/pexels-photo-2774140.jpeg?auto=compress&cs=tinysrgb&w=400", title: "City Run" },
  { image: "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Night Run Salaya" },
  { image: "https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Finisher" },
  { image: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Warm Up" },
  { image: "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg?auto=compress&cs=tinysrgb&w=400", title: "BIB Pickup" },
  { image: "https://images.pexels.com/photos/2377173/pexels-photo-2377173.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Street Run" },
  { image: "https://images.pexels.com/photos/1238961/pexels-photo-1238961.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Group Run" },
  { image: "https://images.pexels.com/photos/10313672/pexels-photo-10313672.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Marathon Crowd" },
  { image: "https://images.pexels.com/photos/767520/pexels-photo-767520.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Sunrise Run" },
];

export async function GET() {
  const key = process.env.PEXELS_API ?? process.env.PEXEL_API;
  
  if (!key) {
    return NextResponse.json(
      { items: curatedMarathonImages, total: curatedMarathonImages.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=thai%20marathon&per_page=20&page=1`,
      {
        headers: { Authorization: key },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ items: curatedMarathonImages });
    }

    const data = await res.json();
    const photos: any[] = data.photos ?? [];

    const items = photos.slice(0, 12).map((p) => ({
      image: p.src?.small ?? p.src?.medium ?? p.url,
      title: (p.alt as string) || `Thai Marathon #${p.id}`,
      href: p.url,
    }));

    return NextResponse.json(
      { items: items.length > 0 ? items : curatedMarathonImages, total: items.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ items: curatedMarathonImages });
  }
}
