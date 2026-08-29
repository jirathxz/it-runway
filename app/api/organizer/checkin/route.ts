import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, registrations, user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการตรวจ BIB", 401);
    }

    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || "Unknown";

    const body = await req.json();
    const { registrationId, query, eventId, action } = body; // action: "checkin" | "uncheck"

    if (!registrationId && !query) {
      return apiError(
        "VALIDATION_ERROR",
        "กรุณาระบุหมายเลข BIB, Chip Code, หรือรหัสผู้สมัคร",
        400
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
      return apiError("BIB_NOT_FOUND", "ไม่พบข้อมูลหมายเลข BIB หรือ Chip Code นี้ในระบบ", 404);
    }

    if (targetReg.status === "cancelled") {
      return apiError(
        "ALREADY_CANCELLED",
        "BIB หมายเลขนี้ถูกยกเลิกการสมัครแล้ว (Cancelled)",
        400
      );
    }

    // Verify organizer rights
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, targetReg.eventId));

    if (!isAdmin && event?.organizerId !== session.user.id) {
      return apiError(
        "FORBIDDEN",
        "คุณไม่มีสิทธิ์ในการตรวจ BIB สำหรับงานวิ่งนี้",
        403
      );
    }

    const isUncheck = action === "uncheck";
    const newStatus = isUncheck ? "no" : "yes";
    const newRegStatus = isUncheck ? "UPCOMING" : "CHECKED_IN";
    const checkinTime = isUncheck ? null : new Date();

    const [updatedReg] = await db
      .update(registrations)
      .set({
        checkedIn: newStatus,
        checkedInAt: checkinTime,
        registrationStatus: newRegStatus,
      })
      .where(eq(registrations.id, targetReg.id))
      .returning();

    // Query runner user info
    const [runnerUser] = await db
      .select({ name: user.name, email: user.email, image: user.image })
      .from(user)
      .where(eq(user.id, targetReg.userId));

    // High-Security Audit Log (WHO, WHAT, WHEN, FROM, TO, IP, USER AGENT)
    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: isAdmin ? "admin" : "organizer",
      action: "ORGANIZER_CHECKIN",
      entityType: "registration",
      entityId: targetReg.id,
      fromState: `checkedIn: ${targetReg.checkedIn}`,
      toState: `checkedIn: ${newStatus}`,
      ipAddress: ip,
      userAgent: userAgent,
      details: {
        bibNumber: targetReg.bibNumber,
        action: action || "checkin",
        eventTitle: event?.title,
      },
    });

    return apiSuccess({
      message: isUncheck
        ? `ยกเลิกการเช็คอิน BIB ${updatedReg.bibNumber} สำเร็จ`
        : `เช็คอิน BIB ${updatedReg.bibNumber} สำเร็จ (มอบอุปกรณ์แล้ว)`,
      registration: {
        ...updatedReg,
        userName: runnerUser?.name || "นักวิ่ง",
        userEmail: runnerUser?.email,
        userImage: runnerUser?.image,
      },
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "เกิดข้อผิดพลาดในการเช็คอิน", 500);
  }
}
