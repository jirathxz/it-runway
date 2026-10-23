import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        bibNumber: registrations.bibNumber,
        corral: registrations.corral,
        distance: registrations.distance,
        tshirtSize: registrations.tshirtSize,
        status: registrations.status,
        chipCode: registrations.chipCode,
        shippingStatus: registrations.shippingStatus,
        trackingNumber: registrations.trackingNumber,
        pickupDate: registrations.pickupDate,
        officialTime: registrations.officialTime,
        pace: registrations.pace,
        rank: registrations.rank,
        registeredAt: registrations.registeredAt,
        eventTitle: events.title,
        eventLocation: events.location,
        eventDate: events.date,
        eventImage: events.image,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.userId, session.user.id))
      .orderBy(desc(registrations.registeredAt));

    const formattedBibs = rows.map((r) => {
      const dt = new Date(r.eventDate);
      const thaiDate = dt.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      });
      const hours = dt.getUTCHours().toString().padStart(2, "0");
      const minutes = dt.getUTCMinutes().toString().padStart(2, "0");
      const timeStr = `${hours}:${minutes} น.`;

      return {
        id: r.id,
        eventId: r.eventId,
        bibNumber: r.bibNumber,
        corral: r.corral,
        eventTitle: r.eventTitle,
        eventDate: thaiDate,
        eventTime: timeStr !== "00:00 น." ? timeStr : "05:00 น.",
        location: r.eventLocation,
        distance: r.distance,
        category: (r.status || "upcoming") as "upcoming" | "completed" | "cancelled",
        status: r.status,
        image:
          r.eventImage ||
          "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
        chipCode: r.chipCode,
        shippingStatus: r.shippingStatus as "delivered" | "pickup" | "completed",
        trackingNumber: r.trackingNumber || undefined,
        pickupDate: r.pickupDate || undefined,
        officialTime: r.officialTime || undefined,
        pace: r.pace || undefined,
        rank: r.rank || undefined,
        tshirtSize: r.tshirtSize,
      };
    });

    return NextResponse.json({ bibs: formattedBibs });
  } catch (error) {
    console.error("GET /api/user/bibs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
