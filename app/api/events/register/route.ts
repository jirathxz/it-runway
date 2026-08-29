import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events, user } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำการสมัครเข้าร่วมการแข่งขัน" },
        { status: 401 }
      );
    }

    // Verify runner profile completeness from DB
    const [runner] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!runner) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลบัญชีผู้ใช้งานในระบบ" },
        { status: 404 }
      );
    }

    const missingFields: string[] = [];
    if (!runner.name || runner.name.trim() === "") missingFields.push("ชื่อ-นามสกุล");
    if (!runner.phoneNumber || runner.phoneNumber.trim() === "") missingFields.push("เบอร์โทรศัพท์ติดต่อ");
    if (!runner.gender || runner.gender.trim() === "") missingFields.push("เพศ");
    if (!runner.birthdate || runner.birthdate.trim() === "") missingFields.push("วันเดือนปีเกิด");
    if (!runner.bloodType || runner.bloodType.trim() === "") missingFields.push("หมู่โลหิต");
    if (!runner.emergencyName || runner.emergencyName.trim() === "") missingFields.push("ชื่อผู้ติดต่อฉุกเฉิน");
    if (!runner.emergencyPhone || runner.emergencyPhone.trim() === "") missingFields.push("เบอร์ติดต่อฉุกเฉิน");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `ข้อมูลส่วนตัวนักวิ่งยังไม่ครบถ้วน (${missingFields.join(", ")}) กรุณากรอกข้อมูลส่วนตัวให้ครบก่อนสมัคร`,
          incompleteProfile: true,
          missingFields,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { eventId, distance, tshirtSize, shippingStatus } = body;

    if (!eventId || !distance) {
      return NextResponse.json(
        { error: "ข้อมูลการสมัครไม่ครบถ้วน กรุณาเลือกระยะทางและขนาดเสื้อ" },
        { status: 400 }
      );
    }

    // Verify event exists
    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventRows.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลงานวิ่งที่ระบุ" },
        { status: 404 }
      );
    }

    const targetEvent = eventRows[0];

    // Check if already registered
    const existing = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.userId, session.user.id),
          eq(registrations.eventId, eventId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "คุณได้ลงทะเบียนเข้าร่วมงานวิ่งนี้ไปแล้ว",
          alreadyRegistered: true,
          bibNumber: existing[0].bibNumber,
        },
        { status: 400 }
      );
    }

    // Generate smart BIB number
    let prefix = "10";
    let corral = "CORRAL B";
    if (distance.includes("21") || distance.toLowerCase().includes("half")) {
      prefix = "21";
      corral = "CORRAL A";
    } else if (distance.includes("5") || distance.toLowerCase().includes("fun")) {
      prefix = "05";
      corral = "CORRAL C";
    } else if (distance.includes("42") || distance.toLowerCase().includes("marathon")) {
      prefix = "42";
      corral = "CORRAL VIP";
    }

    const randomSuffix = Math.floor(10 + Math.random() * 90).toString();
    const bibNumber = `${prefix}${randomSuffix}`;
    const chipCode = `CHIP-NP-${Math.floor(100000 + Math.random() * 900000)}`;

    const eventDate = new Date(targetEvent.date);
    const pickupDateStr = new Date(
      eventDate.getTime() - 24 * 60 * 60 * 1000
    ).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    });

    const [newReg] = await db
      .insert(registrations)
      .values({
        userId: session.user.id,
        eventId: targetEvent.id,
        bibNumber,
        corral,
        distance,
        tshirtSize: tshirtSize || "L",
        status: "upcoming",
        chipCode,
        shippingStatus: shippingStatus === "delivered" ? "delivered" : "pickup",
        pickupDate: shippingStatus === "delivered" ? null : `${pickupDateStr} (10:00 - 18:00 น.)`,
        trackingNumber: shippingStatus === "delivered" ? `TH${Math.floor(10000000 + Math.random() * 90000000)}NP` : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      registration: newReg,
      message: `ลงทะเบียนสำเร็จ! หมายเลข BIB ประจำตัวของคุณคือ ${bibNumber}`,
    });
  } catch (error: any) {
    console.error("POST /api/events/register error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 }
    );
  }
}
