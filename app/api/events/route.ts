import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, registrations, user } from "@/lib/schema";
import { asc, count, ne } from "drizzle-orm";

export const revalidate = 60;

export async function GET() {
  try {
    const rows = await db.select().from(events).orderBy(asc(events.date));

    // Get total users and registrations counts directly from PostgreSQL
    const [userCountRes] = await db.select({ count: count() }).from(user);
    const [regCountRes] = await db.select({ count: count() }).from(registrations);

    // Query active registrations count grouped by event from PostgreSQL
    const regCounts = await db
      .select({
        eventId: registrations.eventId,
        count: count(),
      })
      .from(registrations)
      .where(ne(registrations.status, "cancelled"))
      .groupBy(registrations.eventId);

    const regCountMap = new Map(regCounts.map((r) => [r.eventId, Number(r.count)]));

    const enrichedEvents = rows.map((ev) => {
      const registered = regCountMap.get(ev.id) || 0;
      const totalSlots = ev.slots || 500;
      const remainingSlots = Math.max(0, totalSlots - registered);
      const isSoldOut = remainingSlots === 0;

      return {
        ...ev,
        slots: totalSlots,
        registeredCount: registered,
        remainingSlots,
        isSoldOut,
      };
    });

    return NextResponse.json({
      events: enrichedEvents,
      stats: {
        totalEvents: rows.length,
        totalUsers: Number(userCountRes?.count || 0),
        totalRegistrations: Number(regCountRes?.count || 0),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
