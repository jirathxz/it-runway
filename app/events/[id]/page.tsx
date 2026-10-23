import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { EventDetailView } from "@/components/events/event-detail-view";
import { generateEventDetailData } from "@/lib/event-details-data";
import { db } from "@/lib/db";
import { events, registrations } from "@/lib/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { Footprints } from "lucide-react";

export const revalidate = 60; // 1 minute revalidation

interface EventPageProps {
  params: Promise<{ id: string }>;
}

async function getEventById(id: string) {
  try {
    const rows = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    const [regCount] = await db
      .select({ count: count() })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, id),
          ne(registrations.status, "cancelled")
        )
      );

    const registered = Number(regCount?.count || 0);
    const totalSlots = rows[0].slots || 500;
    const remainingSlots = Math.max(0, totalSlots - registered);

    return {
      ...rows[0],
      slots: totalSlots,
      registeredCount: registered,
      remainingSlots,
      isSoldOut: remainingSlots === 0,
    };
  } catch (error) {
    console.error("Error fetching event by id:", error);
    return null;
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "ไม่พบข้อมูลงานวิ่ง | IT RUNWAY",
    };
  }

  return {
    title: `${event.title} — สมัครงานวิ่งนครปฐม | IT RUNWAY`,
    description: `สมัครงานวิ่ง ${event.title} ระยะทาง ${event.distance} สถานที่ ${event.location} ระบบชิปจับเวลา RFID Chip Timing มาตรฐานสากล`,
    keywords: ["งานวิ่ง", "วิ่งนครปฐม", event.title, event.location, "IT Runway"],
    openGraph: {
      title: `${event.title} | IT RUNWAY`,
      description: `สมัครงานวิ่ง ${event.title} ที่ ${event.location}`,
      images: [event.image || "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940"],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const detailData = generateEventDetailData(event);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <EventDetailView event={event} detailData={detailData} />
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
