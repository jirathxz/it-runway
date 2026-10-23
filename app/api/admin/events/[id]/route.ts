import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit-logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single event for admin
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      return apiError("EVENT_NOT_FOUND", "ไม่พบงานวิ่งที่ระบุ", 404);
    }

    return apiSuccess({ event });
  } catch (error: any) {
    console.error("Admin get event error:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error.message || "Failed to fetch event",
      500
    );
  }
}

// PUT / Edit event for admin
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const {
      title,
      location,
      date,
      distance,
      price,
      slots,
      eventStatus,
      approvalStatus,
      image,
      organizerName,
      organizerContact,
    } = body;

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent) {
      return apiError("EVENT_NOT_FOUND", "ไม่พบงานวิ่งที่ต้องการแก้ไข", 404);
    }

    const updateData: Partial<typeof events.$inferInsert> = {};

    if (title !== undefined) updateData.title = title;
    if (location !== undefined) updateData.location = location;
    if (date !== undefined) updateData.date = new Date(date);
    if (distance !== undefined) updateData.distance = distance;
    if (price !== undefined) updateData.price = Number(price);
    if (slots !== undefined) updateData.slots = Number(slots);
    if (eventStatus !== undefined) updateData.eventStatus = eventStatus;
    if (approvalStatus !== undefined) updateData.approvalStatus = approvalStatus;
    if (image !== undefined) updateData.image = image;
    if (organizerName !== undefined) updateData.organizerName = organizerName;
    if (organizerContact !== undefined) updateData.organizerContact = organizerContact;

    // Legacy status sync
    if (eventStatus !== undefined) {
      updateData.status = eventStatus === "REGISTRATION_OPEN" ? "open" : "closed";
    }

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: "admin",
      action: "ADMIN_EDIT_EVENT",
      entityType: "event",
      entityId: id,
      fromState: `${existingEvent.title} | ${existingEvent.eventStatus} | ${existingEvent.approvalStatus}`,
      toState: `${updatedEvent.title} | ${updatedEvent.eventStatus} | ${updatedEvent.approvalStatus}`,
      ipAddress: ip,
      userAgent: userAgent,
      details: {
        updatedFields: Object.keys(updateData),
        newTitle: updatedEvent.title,
      },
    });

    return apiSuccess({
      message: `อัปเดตข้อมูลงานวิ่ง "${updatedEvent.title}" สำเร็จแล้ว`,
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Admin edit event error:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error.message || "Failed to update event",
      500
    );
  }
}

// DELETE event for admin
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent) {
      return apiError("EVENT_NOT_FOUND", "ไม่พบงานวิ่งที่ต้องการลบ", 404);
    }

    await db.delete(events).where(eq(events.id, id));

    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: "admin",
      action: "ADMIN_DELETE_EVENT",
      entityType: "event",
      entityId: id,
      fromState: `${existingEvent.title} (${existingEvent.approvalStatus})`,
      toState: "DELETED",
      ipAddress: ip,
      userAgent: userAgent,
      details: {
        deletedEventTitle: existingEvent.title,
        deletedEventLocation: existingEvent.location,
      },
    });

    return apiSuccess({
      message: `ลบงานวิ่ง "${existingEvent.title}" ออกจากระบบเรียบร้อยแล้ว`,
      deletedId: id,
    });
  } catch (error: any) {
    console.error("Admin delete event error:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error.message || "Failed to delete event",
      500
    );
  }
}
