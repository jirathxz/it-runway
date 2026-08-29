import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำรายการยกเลิก" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { registrationId, reason, refundAccount, refundBank } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสการสมัครที่ต้องการยกเลิก" },
        { status: 400 }
      );
    }

    // Find registration
    const existing = await db
      .select({
        id: registrations.id,
        bibNumber: registrations.bibNumber,
        status: registrations.status,
        eventTitle: events.title,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(
        and(
          eq(registrations.id, registrationId),
          eq(registrations.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการสมัคร หรือคุณไม่มีสิทธิ์ทำรายการนี้" },
        { status: 404 }
      );
    }

    const target = existing[0];

    if (target.status === "cancelled") {
      return NextResponse.json(
        { error: "รายการนี้ถูกยกเลิกไปแล้ว" },
        { status: 400 }
      );
    }

    if (target.status === "completed") {
      return NextResponse.json(
        { error: "ไม่สามารถยกเลิกงานวิ่งที่เสร็จสิ้นไปแล้วได้" },
        { status: 400 }
      );
    }

    // Update status to cancelled
    await db
      .update(registrations)
      .set({
        status: "cancelled",
      })
      .where(eq(registrations.id, registrationId));

    const refundRef = `REFUND-NP-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      message: `ยกเลิกการสมัครงาน "${target.eventTitle}" (BIB ${target.bibNumber}) เรียบร้อยแล้ว`,
      refundRef,
      reason: reason || "ติดภารกิจด่วน",
      refundAccount: refundAccount || "คืนผ่านช่องทางเดิม",
      refundBank: refundBank || "PromptPay",
    });
  } catch (error: any) {
    console.error("POST /api/events/cancel error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการยกเลิกการสมัคร" },
      { status: 500 }
    );
  }
}
