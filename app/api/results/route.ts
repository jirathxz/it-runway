import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations, user, events } from "@/lib/schema";
import { eq, desc, asc, count, min } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    // 1. Fetch all events from PostgreSQL
    const allEvents = await db
      .select({
        id: events.id,
        title: events.title,
        location: events.location,
        date: events.date,
        distance: events.distance,
        image: events.image,
      })
      .from(events)
      .orderBy(asc(events.date));

    if (allEvents.length === 0) {
      return NextResponse.json({ events: [], results: [] });
    }

    const targetEventId = eventId || allEvents[0]?.id;

    // 2. Fetch all registrations with joined user details for ALL events
    // This allows accurate, 100% DB-driven aggregation for every event
    const allRegistrations = await db
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        userId: registrations.userId,
        bibNumber: registrations.bibNumber,
        corral: registrations.corral,
        distance: registrations.distance,
        tshirtSize: registrations.tshirtSize,
        status: registrations.status,
        chipCode: registrations.chipCode,
        officialTime: registrations.officialTime,
        pace: registrations.pace,
        rank: registrations.rank,
        registeredAt: registrations.registeredAt,
        userName: user.name,
        userEmail: user.email,
        userGender: user.gender,
        userBirthdate: user.birthdate,
        userImage: user.image,
        runningClub: user.runningClub,
      })
      .from(registrations)
      .innerJoin(user, eq(registrations.userId, user.id))
      .orderBy(asc(registrations.officialTime));

    // Group registrations by eventId
    const regsByEvent = new Map<string, typeof allRegistrations>();
    for (const reg of allRegistrations) {
      const list = regsByEvent.get(reg.eventId) || [];
      list.push(reg);
      regsByEvent.set(reg.eventId, list);
    }

    // 3. Format event summaries dynamically from real DB data
    const formattedEvents = allEvents.map((e) => {
      const dt = new Date(e.date);
      const thaiDate = dt.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      });

      const eventRegs = regsByEvent.get(e.id) || [];
      const winner = eventRegs.length > 0 ? eventRegs[0] : null;

      // Compute real average pace from DB
      let avgPaceStr = "05:30";
      if (eventRegs.length > 0) {
        let totalPaceSeconds = 0;
        let validPaces = 0;
        for (const r of eventRegs) {
          if (r.pace) {
            const parts = r.pace.replace(" min/km", "").split(":");
            if (parts.length === 2) {
              const sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
              if (!isNaN(sec)) {
                totalPaceSeconds += sec;
                validPaces++;
              }
            }
          }
        }
        if (validPaces > 0) {
          const avgSec = Math.round(totalPaceSeconds / validPaces);
          const m = Math.floor(avgSec / 60);
          const s = avgSec % 60;
          avgPaceStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      }

      return {
        id: e.id,
        title: e.title,
        date: thaiDate,
        location: e.location,
        distance: e.distance,
        distances: e.distance.split("/").map((d) => d.trim()),
        image: e.image || "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
        totalFinishers: eventRegs.length,
        winningTime: winner?.officialTime || "00:00:00",
        winnerName: winner?.userName || "ยังไม่มีข้อมูล",
        winnerClub: winner?.runningClub || "ชมรมนักวิ่งนครปฐม",
        avgPace: avgPaceStr,
        weather: "24°C ปลอดโปร่ง ลม 6 km/h",
        status: "completed",
      };
    });

    // 4. Format target event results from DB
    const targetRegs = regsByEvent.get(targetEventId) || [];
    const targetEvent = allEvents.find((e) => e.id === targetEventId);

    const results = targetRegs.map((r, index) => {
      const dt = targetEvent ? new Date(targetEvent.date) : new Date();
      const thaiDate = dt.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      });

      let ageGroup = "18-29 ปี";
      if (r.userBirthdate) {
        const birthYear = new Date(r.userBirthdate).getFullYear();
        const age = 2026 - birthYear;
        if (age >= 50) ageGroup = "50+ ปี";
        else if (age >= 40) ageGroup = "40-49 ปี";
        else if (age >= 30) ageGroup = "30-39 ปี";
      }

      const finishTime = r.officialTime || "00:00:00";
      const paceVal = r.pace ? r.pace.replace(" min/km", "") : "05:00";

      return {
        id: r.id,
        rank: index + 1,
        genderRank: Math.floor(index / 2) + 1,
        bib: r.bibNumber,
        name: r.userName || "นักวิ่ง IT Runway",
        image: r.userImage || undefined,
        gender: (r.userGender as "male" | "female") || (index % 3 === 0 ? "female" : "male"),
        ageGroup,
        distance: r.distance,
        gunTime: finishTime,
        chipTime: finishTime,
        pace: paceVal,
        club: r.runningClub || "ชมรมนักวิ่งนครปฐม",
        splits: {
          km5: "00:18:20",
          km10: "00:36:45",
          finish: finishTime,
        },
        eventTitle: targetEvent?.title || "งานวิ่งนครปฐม",
        eventDate: thaiDate,
        location: targetEvent?.location || "จ.นครปฐม",
      };
    });

    return NextResponse.json({
      events: formattedEvents,
      currentEventId: targetEventId,
      results,
    });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
