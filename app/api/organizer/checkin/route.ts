import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, registrations, user } from "@/lib/schema";
import { eq, or, ilike } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการตรวจ BIB" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { registrationId, query, eventId, action } = body; // action: "checkin" | "uncheck"

    if (!registrationId && !query) {
      return NextResponse.json(
        { error: "กรุณาระบุหมายเลข BIB, Chip Code, หรือรหัสผู้สมัคร" },
        { status: 400 }
      );
    }

    const isAdmin = (session.user as any)?.role === "admin";

    // Query registration
    let targetReg: any = null;

    if (registrationId) {
      const [reg] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, registrationId));
      targetReg = reg;
    } else if (query) {
      const cleanQuery = query.trim().toUpperCase();
      const rows = await db.select().from(registrations);
      targetReg = rows.find((r) => {
        const matchesQuery =
          r.bibNumber.toUpperCase() === cleanQuery ||
          r.chipCode.toUpperCase() === cleanQuery ||
          r.id.toUpperCase() === cleanQuery;
        if (eventId) {
          return matchesQuery && r.eventId === eventId;
        }
        return matchesQuery;
      });
    }

    if (!targetReg) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลหมายเลข BIB หรือ Chip Code นี้ในระบบ" },
        { status: 404 }
      );
    }

    if (targetReg.status === "cancelled") {
      return NextResponse.json(
        { error: "BIB หมายเลขนี้ถูกยกเลิกการสมัครแล้ว (Cancelled)" },
        { status: 400 }
      );
    }

    // Verify organizer rights
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, targetReg.eventId));

    if (!isAdmin && event?.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการตรวจ BIB สำหรับงานวิ่งนี้" },
        { status: 403 }
      );
    }

    const isUncheck = action === "uncheck";
    const newStatus = isUncheck ? "no" : "yes";
    const checkinTime = isUncheck ? null : new Date();

    const [updatedReg] = await db
      .update(registrations)
      .set({
        checkedIn: newStatus,
        checkedInAt: checkinTime,
      })
      .where(eq(registrations.id, targetReg.id))
      .returning();

    // Query runner user info
    const [runnerUser] = await db
      .select({ name: user.name, email: user.email, image: user.image })
      .from(user)
      .where(eq(user.id, targetReg.userId));

    return NextResponse.json({
      success: true,
      message: isUncheck
        ? `ยกเลิกการเช็คอิน BIB ${targetReg.bibNumber} เรียบร้อยแล้ว`
        : `เช็คอิน BIB ${targetReg.bibNumber} สำเร็จ!`,
      runner: {
        ...updatedReg,
        userName: runnerUser?.name || "นักวิ่ง IT Runway",
        userEmail: runnerUser?.email || "",
        userImage: runnerUser?.image || null,
        eventName: event?.title || "งานวิ่งนครปฐม",
      },
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการเช็คอิน" },
      { status: 500 }
    );
  }
}
