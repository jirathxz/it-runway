import { NextRequest, NextResponse } from "next/server";
import { processRfidDetection } from "@/lib/timing-engine";
import { db } from "@/lib/db";
import { rfidReads, events } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chipId, bibId, readerId, checkpointId, eventId, rawData } = body;

    if (!bibId) {
      return NextResponse.json({ error: "Missing required field: bibId" }, { status: 400 });
    }

    // Resolve eventId if not provided (fallback to active Nakhon Pathom event)
    let resolvedEventId = eventId;
    if (!resolvedEventId) {
      const activeEvent = await db.select().from(events).limit(1);
      resolvedEventId = activeEvent[0]?.id;
    }

    if (!resolvedEventId) {
      return NextResponse.json({ error: "No active event found" }, { status: 404 });
    }

    const result = await processRfidDetection({
      chipId: chipId || `NP-TIMING-${bibId}`,
      bibId: bibId,
      readerId: readerId || "READER-FINISH-MAT-01",
      checkpointId: checkpointId,
      eventId: resolvedEventId,
      detectedAt: new Date(),
      rawData: rawData || {
        rssi: -62,
        antennaPort: 1,
        frequencyMhz: 922.5,
      },
    });

    return NextResponse.json({
      success: true,
      message: "RFID detection ingested and processed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("RFID Ingestion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process RFID read event" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    let query = db.select().from(rfidReads).orderBy(desc(rfidReads.detectedAt)).limit(50);
    if (eventId) {
      // @ts-ignore
      query = db
        .select()
        .from(rfidReads)
        .where(eq(rfidReads.eventId, eventId))
        .orderBy(desc(rfidReads.detectedAt))
        .limit(50);
    }

    const logs = await query;
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
