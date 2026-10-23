import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, registrations, user } from "@/lib/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนเข้าถึงข้อมูลนักวิ่ง", 401);
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const includeFullMedical = searchParams.get("includeMedical") === "true";

    const isAdmin = (session.user as any)?.role === "admin";

    // Query events to verify authorization (Strictly organizer's own approved events)
    const accessibleEvents = isAdmin
      ? await db.select().from(events)
      : await db
          .select()
          .from(events)
          .where(
            and(
              eq(events.organizerId, session.user.id),
              or(
                eq(events.approvalStatus, "approved"),
                eq(events.approvalStatus, "APPROVED")
              )
            )
          );

    if (accessibleEvents.length === 0) {
      return apiError(
        "NO_ORGANIZED_EVENTS",
        "คุณยังไม่มีงานวิ่งที่ได้รับอนุมัติในระบบ (ระบบตรวจ BIB สงวนสิทธิ์เฉพาะงานวิ่งที่คุณเป็นผู้จัดเท่านั้น)",
        403
      );
    }

    const targetEventId = eventId || accessibleEvents[0].id;
    const targetEvent = accessibleEvents.find((e) => e.id === targetEventId);

    if (!targetEvent) {
      return apiError(
        "FORBIDDEN",
        "คุณไม่มีสิทธิ์เข้าถึงหรือตรวจ BIB งานวิ่งนี้ (อนุญาตเฉพาะผู้จัดงานที่เป็นเจ้าของงานวิ่งเท่านั้น)",
        403
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
        registrationStatus: registrations.registrationStatus,
        ageGroup: registrations.ageGroup,
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
        rawMedicalConditions: user.medicalConditions,
        bloodType: user.bloodType,
      })
      .from(registrations)
      .leftJoin(user, eq(registrations.userId, user.id))
      .where(eq(registrations.eventId, targetEventId as any))
      .orderBy(desc(registrations.registeredAt));

    // PDPA: Data Minimization & Privacy Protection
    // Medical conditions are protected by default - only send boolean flag unless authorized
    const sanitizedParticipants = regRows.map((r) => {
      const hasMedical = Boolean(
        r.rawMedicalConditions &&
        r.rawMedicalConditions.trim() !== "" &&
        r.rawMedicalConditions !== "ไม่มีโรคประจำตัว"
      );

      return {
        id: r.id,
        userId: r.userId,
        eventId: r.eventId,
        bibNumber: r.bibNumber,
        corral: r.corral,
        distance: r.distance,
        tshirtSize: r.tshirtSize,
        status: r.status,
        registrationStatus: r.registrationStatus || "UPCOMING",
        ageGroup: r.ageGroup || "30-39",
        chipCode: r.chipCode,
        shippingStatus: r.shippingStatus,
        trackingNumber: r.trackingNumber,
        checkedIn: r.checkedIn,
        checkedInAt: r.checkedInAt,
        registeredAt: r.registeredAt,
        userName: r.userName || "นักวิ่ง",
        userEmail: r.userEmail,
        userImage: r.userImage,
        userPhone: r.userPhone,
        gender: r.gender,
        emergencyName: r.emergencyName,
        emergencyPhone: r.emergencyPhone,
        bloodType: r.bloodType,
        hasMedicalAlert: hasMedical,
        // Only provide plain text medical details if explicitly authorized and logged
        medicalConditions: includeFullMedical && (isAdmin || targetEvent?.organizerId === session.user.id)
          ? r.rawMedicalConditions
          : hasMedical
          ? "มีข้อมูลความเสี่ยงทางการแพทย์ (เข้าถึงได้เฉพาะทีมปฐมพยาบาล)"
          : "ไม่มีโรคประจำตัว",
      };
    });

    if (includeFullMedical) {
      const ip =
        reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        reqHeaders.get("x-real-ip") ||
        "127.0.0.1";
      const userAgent = reqHeaders.get("user-agent") || "Unknown";

      await recordAuditLog({
        userId: session.user.id,
        userName: session.user.name,
        userRole: isAdmin ? "admin" : "organizer",
        action: "MEDICAL_RECORD_ACCESSED",
        entityType: "medical_record",
        entityId: targetEventId,
        details: { eventTitle: targetEvent?.title, count: regRows.length },
        ipAddress: ip,
        userAgent: userAgent,
      });
    }

    const totalCount = sanitizedParticipants.length;
    const checkedInCount = sanitizedParticipants.filter((r) => r.checkedIn === "yes").length;
    const pendingCount = totalCount - checkedInCount;

    return apiSuccess({
      event: targetEvent,
      accessibleEvents,
      participants: sanitizedParticipants,
      stats: {
        total: totalCount,
        checkedIn: checkedInCount,
        pending: pendingCount,
        percent: totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error("Failed to get organizer participants:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "Failed to load participants", 500);
  }
}
