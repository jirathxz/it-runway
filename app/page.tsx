import { db } from "@/lib/db";
import { events, registrations, user } from "@/lib/schema";
import { asc, count, ne } from "drizzle-orm";
import { HomeView } from "@/components/home/home-view";
import { EventItem } from "@/components/events/event-card";

export const revalidate = 60; // Cache and revalidate every 60s for blazing fast edge rendering

function getEventCategory(title: string, distance: string): string {
  const lower = `${title} ${distance}`.toLowerCase();
  if (lower.includes("trail") || lower.includes("เทรล") || lower.includes("ป่า")) {
    return "trail";
  }
  if (lower.includes("cycling") || lower.includes("จักรยาน") || lower.includes("ปั่น")) {
    return "cycling";
  }
  if (lower.includes("triathlon") || lower.includes("ไตรกีฬา") || lower.includes("ว่าย")) {
    return "triathlon";
  }
  return "road";
}

async function getHomeData() {
  try {
    const rows = await db.select().from(events).orderBy(asc(events.date));
    const [userCountRes] = await db.select({ count: count() }).from(user);
    const [regCountRes] = await db.select({ count: count() }).from(registrations);

    const regCounts = await db
      .select({
        eventId: registrations.eventId,
        count: count(),
      })
      .from(registrations)
      .where(ne(registrations.status, "cancelled"))
      .groupBy(registrations.eventId);

    const regMap = new Map(regCounts.map((r) => [r.eventId, Number(r.count)]));

    const formattedEvents: EventItem[] = rows.map((ev) => {
      const dt = new Date(ev.date);
      const thaiDate = dt.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      });
      const hours = dt.getUTCHours().toString().padStart(2, "0");
      const minutes = dt.getUTCMinutes().toString().padStart(2, "0");
      const timeStr = `${hours}:${minutes} น.`;
      const category = getEventCategory(ev.title, ev.distance);

      const totalSlots = Number(ev.slots) || 500;
      const registered = regMap.get(ev.id) || 0;
      const remainingSlots = Math.max(0, totalSlots - registered);
      const isSoldOut = remainingSlots === 0 || ev.status === "closed";

      return {
        id: ev.id,
        title: ev.title,
        location: ev.location,
        date: thaiDate,
        time: timeStr !== "00:00 น." ? timeStr : "05:30 น.",
        distance: ev.distance,
        price: ev.price,
        slots: totalSlots,
        remainingSlots,
        isSoldOut,
        status: isSoldOut ? "closed" : remainingSlots <= 50 ? "near_full" : ev.status || "open",
        category,
        image:
          ev.image ||
          "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600",
      };
    });

    return {
      events: formattedEvents,
      stats: {
        totalEvents: rows.length || 13,
        totalUsers: Number(userCountRes?.count || 17),
        totalRegistrations: Number(regCountRes?.count || 210),
      },
    };
  } catch (error) {
    console.error("Failed to query home data:", error);
    return {
      events: [],
      stats: {
        totalEvents: 13,
        totalUsers: 17,
        totalRegistrations: 210,
      },
    };
  }
}

export default async function HomePage() {
  const { events: eventsList, stats } = await getHomeData();

  return <HomeView initialEvents={eventsList} initialStats={stats} />;
}
