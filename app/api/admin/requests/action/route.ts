import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user || (session.user as any)?.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "พื้นที่สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น",
        403
      );
    }

    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || "Unknown";

    const body = await req.json();
    const { eventId, action, reason } = body; // action: "approve" | "reject"

    if (!eventId || !action || !["approve", "reject"].includes(action)) {
      return apiError(
        "VALIDATION_ERROR",
        "พารามิเตอร์ไม่ถูกต้อง (ต้องการ eventId และ action)",
        400
      );
    }

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!existingEvent) {
      return apiError("EVENT_NOT_FOUND", "ไม่พบงานวิ่งที่ระบุ", 404);
    }

    const newApprovalStatus = action === "approve" ? "APPROVED" : "REJECTED";
    const newEventStatus = action === "approve" ? "REGISTRATION_OPEN" : "DRAFT";

    const [updatedEvent] = await db
      .update(events)
      .set({
        approvalStatus: newApprovalStatus,
        eventStatus: newEventStatus,
        status: action === "approve" ? "open" : "closed",
      })
      .where(eq(events.id, eventId))
      .returning();

    // High-Security Audit Log (WHO, WHAT, WHEN, FROM, TO, IP, USER AGENT)
    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: "admin",
      action: action === "approve" ? "ADMIN_APPROVE_EVENT" : "ADMIN_REJECT_EVENT",
      entityType: "event",
      entityId: eventId,
      fromState: `${existingEvent.approvalStatus} | ${existingEvent.eventStatus || "DRAFT"}`,
      toState: `${newApprovalStatus} | ${newEventStatus}`,
      ipAddress: ip,
      userAgent: userAgent,
      details: {
        eventTitle: updatedEvent.title,
        reason: reason || (action === "approve" ? "อนุมัติเปิดรับสมัคร" : "เอกสารหรือเงื่อนไขไม่ผ่านเกณฑ์"),
      },
    });

    return apiSuccess({
      message:
        action === "approve"
          ? `อนุมัติงานวิ่ง "${updatedEvent.title}" เรียบร้อยแล้ว สมาชิกผู้ขอจัดได้รับสิทธิ์ผู้จัดงานและเปิดระบบตรวจ BIB ทันที`
          : `ปฏิเสธคำขอจัดงานวิ่ง "${updatedEvent.title}" เรียบร้อยแล้ว`,
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Admin event action error:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error.message || "เกิดข้อผิดพลาดในการประมวลผล",
      500
    );
  }
}
