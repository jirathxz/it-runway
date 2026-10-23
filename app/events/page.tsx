import * as React from "react";
import { Navbar } from "@/components/navbar";
import { EventsExplorer } from "@/components/events/events-explorer";
import { EventItem } from "@/components/events/event-card";
import { db } from "@/lib/db";
import { events, registrations } from "@/lib/schema";
import { asc, count, ne } from "drizzle-orm";
import { Footprints } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

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

async function getEvents(): Promise<EventItem[]> {
  try {
    const rows = await db.select().from(events).orderBy(asc(events.date));
    const regCounts = await db
      .select({
        eventId: registrations.eventId,
        count: count(),
      })
      .from(registrations)
      .where(ne(registrations.status, "cancelled"))
      .groupBy(registrations.eventId);

    const regMap = new Map(regCounts.map((r) => [r.eventId, Number(r.count)]));

    return rows.map((ev) => {
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
        image: ev.image || "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
      };
    });
  } catch (error) {
    console.error("Failed to query events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const eventsList = await getEvents();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Events Content */}
      <main className="flex-1 w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <React.Suspense fallback={
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Footprints className="size-8 animate-pulse text-[var(--accent)]" />
            <span className="text-xs font-mono text-[var(--ink-3)]">กำลังโหลดรายการงานวิ่ง...</span>
          </div>
        }>
          <EventsExplorer initialEvents={eventsList} />
        </React.Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-6 mt-12 bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 font-[var(--font-mono)] text-xs text-[var(--ink-3)]">
          <span>© 2026 IT RUNWAY — Nakhon Pathom Running Capital.</span>
          <span className="flex items-center gap-2 text-[var(--accent)] font-bold">
            <Footprints className="size-3.5" />
            <span>RUNWAY TIMING ENGINE • RFID CHIP SYSTEM</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
