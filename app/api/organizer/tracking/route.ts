import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { registrationId, trackingNumber, shippingStatus } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน (registrationId required)" },
        { status: 400 }
      );
    }

    // Verify registration exists
    const regList = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการลงทะเบียน" },
        { status: 404 }
      );
    }

    const reg = regList[0];
    const isAdmin = (session.user as any)?.role === "admin";

    // Verify event ownership if not admin
    if (!isAdmin) {
      const eventList = await db
        .select()
        .from(events)
        .where(eq(events.id, reg.eventId))
        .limit(1);

      if (eventList.length === 0 || eventList[0].organizerId !== session.user.id) {
        return NextResponse.json(
          { error: "คุณไม่มีสิทธิ์แก้ไขข้อมูลการจัดส่งของงานนี้" },
          { status: 403 }
        );
      }
    }

    // Update tracking number and shipping status
    await db
      .update(registrations)
      .set({
        trackingNumber: trackingNumber || null,
        shippingStatus: shippingStatus || (trackingNumber ? "delivered" : reg.shippingStatus),
      })
      .where(eq(registrations.id, registrationId));

    return NextResponse.json({
      success: true,
      message: "อัปเดตหมายเลขพัสดุเรียบร้อยแล้ว",
      trackingNumber,
      shippingStatus: shippingStatus || (trackingNumber ? "delivered" : reg.shippingStatus),
    });
  } catch (error: any) {
    console.error("Failed to update tracking number:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tracking number" },
      { status: 500 }
    );
  }
}
