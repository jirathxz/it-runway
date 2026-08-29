import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, registrations, user } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนเข้าถึงข้อมูลนักวิ่ง" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    const isAdmin = (session.user as any)?.role === "admin";

    // Query events to verify authorization
    const allEvents = await db.select().from(events);
    const accessibleEvents = isAdmin
      ? allEvents
      : allEvents.filter(
          (ev) => ev.organizerId === session.user.id && ev.approvalStatus === "approved"
        );

    if (accessibleEvents.length === 0) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการจัดการงานวิ่งนี้" },
        { status: 403 }
      );
    }

    const targetEventId = eventId || accessibleEvents[0].id;
    const targetEvent = accessibleEvents.find((e) => e.id === targetEventId);

    if (!targetEvent && !isAdmin) {
      return NextResponse.json(
        { error: "ไม่พบงานวิ่งที่ระบุหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    // Query registrations for targetEventId
    const regRows = await db
      .select({
        id: registrations.id,
        userId: registrations.userId,
        eventId: registrations.eventId,
        bibNumber: registrations.bibNumber,
        corral: registrations.corral,
        distance: registrations.distance,
        tshirtSize: registrations.tshirtSize,
        status: registrations.status,
        chipCode: registrations.chipCode,
        shippingStatus: registrations.shippingStatus,
        trackingNumber: registrations.trackingNumber,
        checkedIn: registrations.checkedIn,
        checkedInAt: registrations.checkedInAt,
        registeredAt: registrations.registeredAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        userPhone: user.phoneNumber,
        gender: user.gender,
        emergencyName: user.emergencyName,
        emergencyPhone: user.emergencyPhone,
      })
      .from(registrations)
      .leftJoin(user, eq(registrations.userId, user.id))
      .where(eq(registrations.eventId, targetEventId as any))
      .orderBy(desc(registrations.registeredAt));

    const totalCount = regRows.length;
    const checkedInCount = regRows.filter((r) => r.checkedIn === "yes").length;
    const pendingCount = totalCount - checkedInCount;

    return NextResponse.json({
      event: targetEvent,
      accessibleEvents,
      participants: regRows,
      stats: {
        total: totalCount,
        checkedIn: checkedInCount,
        pending: pendingCount,
        percent: totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error("Failed to get organizer participants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load participants" },
      { status: 500 }
    );
  }
}
