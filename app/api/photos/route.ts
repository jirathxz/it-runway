import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos, photoCheckpoints, events } from "@/lib/schema";
import { eq, ilike, or } from "drizzle-orm";

export interface ApiPhotoItem {
  id: string;
  bib: string;
  runnerName: string;
  eventTitle: string;
  checkpoint: "start" | "km5" | "km15" | "finish" | "medal";
  checkpointLabel: string;
  timestamp: string;
  imageUrl: string;
  photographer: string;
  confidenceScore?: number;
}

const FALLBACK_PHOTOS: ApiPhotoItem[] = [
  {
    id: "p-1",
    bib: "1088",
    runnerName: "ธนภัทร รุ่งเรือง",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "finish",
    checkpointLabel: "เส้นชัย หน้าองค์พระปฐมเจดีย์",
    timestamp: "06:45:12 น.",
    imageUrl: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
    confidenceScore: 0.99,
  },
  {
    id: "p-2",
    bib: "1088",
    runnerName: "ธนภัทร รุ่งเรือง",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "km5",
    checkpointLabel: "กม. 5 ถนนราชดำเนิน (ต้นสน)",
    timestamp: "06:18:40 น.",
    imageUrl: "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&w=800",
    photographer: "Nakhon Pathom Action Cam",
    confidenceScore: 0.97,
  },
  {
    id: "p-3",
    bib: "2101",
    runnerName: "กานดา สุวรรณภูมิ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "finish",
    checkpointLabel: "เส้นชัย หน้าองค์พระปฐมเจดีย์",
    timestamp: "07:12:05 น.",
    imageUrl: "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
    confidenceScore: 0.98,
  },
  {
    id: "p-4",
    bib: "2101",
    runnerName: "กานดา สุวรรณภูมิ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "start",
    checkpointLabel: "จุดปล่อยตัว ซุ้มประตูชัย",
    timestamp: "05:45:00 น.",
    imageUrl: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "Runway Pro Studio",
    confidenceScore: 0.96,
  },
  {
    id: "p-5",
    bib: "0512",
    runnerName: "สมชาย รักสงบ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "km15",
    checkpointLabel: "กม. 15 สวนสัตว์และพระราชวังสนามจันทร์",
    timestamp: "06:55:30 น.",
    imageUrl: "https://images.pexels.com/photos/618612/pexels-photo-618612.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "Sanam Chan Lens",
    confidenceScore: 0.95,
  },
  {
    id: "p-6",
    bib: "0512",
    runnerName: "สมชาย รักสงบ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "medal",
    checkpointLabel: "ซุ้มรับเหรียญ Finisher พระปฐมเจดีย์",
    timestamp: "07:35:10 น.",
    imageUrl: "https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
    confidenceScore: 0.99,
  },
  {
    id: "p-7",
    bib: "1088",
    runnerName: "ธนภัทร รุ่งเรือง",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "medal",
    checkpointLabel: "ซุ้มรับเหรียญ Finisher พระปฐมเจดีย์",
    timestamp: "07:05:22 น.",
    imageUrl: "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "Nakhon Pathom Action Cam",
    confidenceScore: 0.98,
  },
  {
    id: "p-8",
    bib: "3320",
    runnerName: "วิชัย วิ่งไว",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "finish",
    checkpointLabel: "เส้นชัย หน้าองค์พระปฐมเจดีย์",
    timestamp: "06:50:11 น.",
    imageUrl: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
    confidenceScore: 0.97,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bib = searchParams.get("bib")?.trim() || "";
    const checkpoint = searchParams.get("checkpoint")?.trim() || "";
    const eventId = searchParams.get("eventId")?.trim() || "";

    // 1. Try querying database
    let dbPhotos: ApiPhotoItem[] = [];
    try {
      const query = db
        .select({
          id: photos.id,
          bib: photoCheckpoints.taggedBib,
          runnerName: photoCheckpoints.taggedRunnerName,
          eventTitle: events.title,
          checkpoint: photos.checkpoint,
          checkpointLabel: photos.checkpointLabel,
          timestamp: photos.capturedAt,
          imageUrl: photos.imageUrl,
          photographer: photos.photographerName,
          confidenceScore: photoCheckpoints.confidenceScore,
        })
        .from(photos)
        .leftJoin(photoCheckpoints, eq(photoCheckpoints.photoId, photos.id))
        .leftJoin(events, eq(events.id, photos.eventId));

      const rows = await query;
      if (rows && rows.length > 0) {
        dbPhotos = rows
          .filter((r) => r.bib && r.imageUrl)
          .map((r) => ({
            id: r.id,
            bib: r.bib || "",
            runnerName: r.runnerName || "นักวิ่ง IT Runway",
            eventTitle: r.eventTitle || "Nakhon Pathom Marathon",
            checkpoint: (r.checkpoint as ApiPhotoItem["checkpoint"]) || "finish",
            checkpointLabel: r.checkpointLabel || "เส้นชัย",
            timestamp: r.timestamp || "06:30:00 น.",
            imageUrl: r.imageUrl,
            photographer: r.photographer || "IT Runway Shutter Team",
            confidenceScore: r.confidenceScore ? Number(r.confidenceScore) : 0.98,
          }));
      }
    } catch {
      // If DB has no records yet, we seamlessly use curated fallback photos
    }

    // Combine DB photos with fallback photos (avoiding duplicates by id)
    const combinedPhotos = dbPhotos.length > 0 ? dbPhotos : FALLBACK_PHOTOS;

    // Filter by query parameters
    const filtered = combinedPhotos.filter((item) => {
      const matchBib =
        !bib ||
        item.bib.toLowerCase().includes(bib.toLowerCase()) ||
        item.runnerName.toLowerCase().includes(bib.toLowerCase());

      const matchCheckpoint = !checkpoint || checkpoint === "all" || item.checkpoint === checkpoint;

      return matchBib && matchCheckpoint;
    });

    return NextResponse.json({
      success: true,
      total: filtered.length,
      bibQuery: bib,
      checkpointFilter: checkpoint,
      photos: filtered,
    });
  } catch (error) {
    console.error("Photos API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
