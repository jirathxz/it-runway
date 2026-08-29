import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนทำการซิงค์ข้อมูล", 401);
    }

    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || "Unknown";

    const body = await req.json();
    const { eventId, items } = body;

    if (!eventId || !Array.isArray(items) || items.length === 0) {
      return apiError("VALIDATION_ERROR", "ไม่พบรายการเช็คอินที่ต้องการซิงค์", 400);
    }

    const isAdmin = (session.user as any)?.role === "admin";
    const [targetEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!targetEvent) {
      return apiError("EVENT_NOT_FOUND", "ไม่พบงานวิ่งที่ระบุ", 404);
    }

    if (targetEvent.organizerId !== session.user.id && !isAdmin) {
      return apiError("FORBIDDEN", "คุณไม่มีสิทธิ์ซิงค์ข้อมูลงานวิ่งนี้", 403);
    }

    let syncedCount = 0;
    let duplicateCount = 0;
    let conflictCount = 0;
    const conflicts: Array<{ bibNumber: string; reason: string }> = [];
    const syncedBibs: string[] = [];

    for (const item of items) {
      const { registrationId, bibNumber, checkedInAt } = item;
      const clientCheckinDate = checkedInAt ? new Date(checkedInAt) : new Date();

      // Find server record
      const [serverReg] = await db
        .select()
        .from(registrations)
        .where(
          registrationId
            ? eq(registrations.id, registrationId)
            : and(eq(registrations.eventId, eventId), eq(registrations.bibNumber, bibNumber))
        )
        .limit(1);

      if (!serverReg) {
        conflictCount++;
        conflicts.push({ bibNumber, reason: "ไม่พบข้อมูลการลงทะเบียนบน Server" });
        continue;
      }

      if (serverReg.status === "cancelled") {
        conflictCount++;
        conflicts.push({ bibNumber, reason: "รายการนี้ถูกยกเลิกแล้วบนระบบหลัก" });
        continue;
      }

      if (serverReg.checkedIn === "yes") {
        // Conflict Resolution Policy: Idempotency & Earliest Timestamp Preservation
        duplicateCount++;
        syncedBibs.push(bibNumber);

        // If client scan occurred earlier than recorded server timestamp, update to earlier accurate time
        if (serverReg.checkedInAt && clientCheckinDate < new Date(serverReg.checkedInAt)) {
          await db
            .update(registrations)
            .set({
              checkedInAt: clientCheckinDate,
            })
            .where(eq(registrations.id, serverReg.id));
        }
      } else {
        // Normal first-time sync
        await db
          .update(registrations)
          .set({
            checkedIn: "yes",
            checkedInAt: clientCheckinDate,
            registrationStatus: "CHECKED_IN",
          })
          .where(eq(registrations.id, serverReg.id));

        syncedCount++;
        syncedBibs.push(bibNumber);
      }
    }

    // High-Security Audit Log
    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: isAdmin ? "admin" : "organizer",
      action: "OFFLINE_CHECKIN_SYNC",
      entityType: "checkin",
      entityId: eventId,
      details: {
        totalReceived: items.length,
        syncedCount,
        duplicateCount,
        conflictCount,
        conflicts,
      },
      ipAddress: ip,
      userAgent: userAgent,
    });

    return apiSuccess({
      message: `ซิงค์ข้อมูลออฟไลน์เรียบร้อยแล้ว: สำเร็จ ${syncedCount} รายการ, รายการซ้ำ ${duplicateCount} รายการ, ข้อขัดแย้ง ${conflictCount} รายการ`,
      syncedCount,
      duplicateCount,
      conflictCount,
      conflicts,
      syncedBibs,
    });
  } catch (error: any) {
    console.error("Offline sync error:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "เกิดข้อผิดพลาดในการซิงค์ข้อมูล", 500);
  }
}
