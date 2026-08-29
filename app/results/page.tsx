import * as React from "react";
import { Navbar } from "@/components/navbar";
import { ResultsView } from "@/components/results/results-view";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { Trophy } from "lucide-react";
import { EventItem } from "@/components/events/event-card";

export const revalidate = 60;

export const metadata = {
  title: "ผลการแข่งขันและสถิติเวลาอย่างเป็นทางการ | IT RUNWAY",
  description: "ตรวจสอบอันดับ สถิติเวลา Gun Time, Chip Time ความเร็วเฉลี่ย (Pace) และดาวน์โหลด e-Certificate สำหรับงานวิ่งในนครปฐม",
};

async function getEvents(): Promise<EventItem[]> {
  try {
    const rows = await db.select().from(events).orderBy(asc(events.date));
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

      return {
        id: ev.id,
        title: ev.title,
        location: ev.location,
        date: thaiDate,
        time: timeStr !== "00:00 น." ? timeStr : "05:30 น.",
        distance: ev.distance,
        price: ev.price,
        slots: "300+",
        status: ev.status || "open",
        category: "road",
        image: ev.image || "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
      };
    });
  } catch (error) {
    console.error("Failed to query events for results page:", error);
    return [];
  }
}

export default async function ResultsPage() {
  const eventsList = await getEvents();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Results Leaderboard Container */}
      <main className="flex-1 w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <ResultsView />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-6 mt-12 bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 font-[var(--font-mono)] text-xs text-[var(--ink-3)]">
          <span>© 2026 IT RUNWAY — Nakhon Pathom Timing Gate & Results.</span>
          <span className="flex items-center gap-2 text-[var(--accent)] font-bold">
            <Trophy className="size-3.5" />
            <span>OFFICIAL TIMING SYSTEM</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
