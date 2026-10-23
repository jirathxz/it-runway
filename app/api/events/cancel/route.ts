import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events, registrationCancellations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { recordAuditLog } from "@/lib/audit-logger";

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
        registrationStatus: "CANCELLED",
      })
      .where(eq(registrations.id, registrationId));

    const refundRef = `REFUND-NP-${Math.floor(100000 + Math.random() * 900000)}`;

    // Persist into registrationCancellations table for financial accounting
    await db.insert(registrationCancellations).values({
      registrationId: target.id,
      userId: session.user.id,
      reason: reason || "ติดภารกิจด่วน",
      refundMethod: refundBank?.toLowerCase().includes("bank") ? "bank_account" : "promptpay",
      refundAccount: refundAccount || "คืนผ่านช่องทางเดิม",
      refundAmount: 650,
      status: "completed",
    });

    // Record audit log
    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: "user",
      action: "ADMIN_CANCEL_REGISTRATION",
      entityType: "registration",
      entityId: registrationId,
      fromState: target.status,
      toState: "cancelled",
      details: {
        bibNumber: target.bibNumber,
        eventTitle: target.eventTitle,
        reason: reason || "ติดภารกิจด่วน",
        refundRef,
      },
    });

    // Dispatch multi-channel notification for Event Cancelled / Refund
    try {
      const { NotificationService } = await import("@/lib/notification-service");
      await NotificationService.notifyEventCancelled(
        session.user.id,
        target.eventTitle,
        650
      );
    } catch (notifErr) {
      console.error("Failed to dispatch cancel notification:", notifErr);
    }

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
