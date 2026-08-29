import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit-logger";
import { NotificationService } from "@/lib/notification-service";

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ", 401);
    }

    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || "Unknown";

    const body = await req.json();
    const { registrationId, trackingNumber, shippingStatus } = body;

    if (!registrationId) {
      return apiError("VALIDATION_ERROR", "ข้อมูลไม่ครบถ้วน (registrationId required)", 400);
    }

    // Verify registration exists
    const regList = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (regList.length === 0) {
      return apiError("REGISTRATION_NOT_FOUND", "ไม่พบข้อมูลการลงทะเบียน", 404);
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
        return apiError("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขข้อมูลการจัดส่งของงานนี้", 403);
      }
    }

    const targetShippingStatus = shippingStatus || (trackingNumber ? "delivered" : reg.shippingStatus);

    // Update tracking number and shipping status
    await db
      .update(registrations)
      .set({
        trackingNumber: trackingNumber || null,
        shippingStatus: targetShippingStatus,
      })
      .where(eq(registrations.id, registrationId));

    // Audit log
    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: isAdmin ? "admin" : "organizer",
      action: "ORGANIZER_CHECKIN",
      entityType: "registration",
      entityId: registrationId,
      fromState: `tracking: ${reg.trackingNumber || "none"}`,
      toState: `tracking: ${trackingNumber || "none"}`,
      ipAddress: ip,
      userAgent: userAgent,
      details: { bibNumber: reg.bibNumber, trackingNumber, shippingStatus: targetShippingStatus },
    });

    // Multi-channel notification for shipping updated
    if (trackingNumber) {
      const [eventData] = await db
        .select({ title: events.title })
        .from(events)
        .where(eq(events.id, reg.eventId))
        .limit(1);

      await NotificationService.notifyShippingUpdated(
        reg.userId,
        eventData?.title || "งานวิ่ง",
        reg.bibNumber,
        trackingNumber
      );
    }

    return apiSuccess({
      message: "อัปเดตหมายเลขพัสดุเรียบร้อยแล้ว",
      trackingNumber,
      shippingStatus: targetShippingStatus,
    });
  } catch (error: any) {
    console.error("Failed to update tracking number:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "Failed to update tracking number", 500);
  }
}
