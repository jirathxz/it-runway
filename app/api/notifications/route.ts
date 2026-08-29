import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน", 401);
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    const unreadOnly = searchParams.get("unread") === "true";

    // Query user notifications
    const allUserNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.sentAt));

    const filtered = allUserNotifs.filter((n) => {
      if (channel && n.channel !== channel) return false;
      if (unreadOnly && n.isRead) return false;
      return true;
    });

    const unreadCount = allUserNotifs.filter((n) => !n.isRead && n.channel === "in_app").length;
    const emailCount = allUserNotifs.filter((n) => n.channel === "email").length;
    const smsCount = allUserNotifs.filter((n) => n.channel === "sms").length;
    const pushCount = allUserNotifs.filter((n) => n.channel === "push").length;

    return apiSuccess({
      notifications: filtered,
      counts: {
        total: allUserNotifs.length,
        unread: unreadCount,
        email: emailCount,
        sms: smsCount,
        push: pushCount,
        inApp: allUserNotifs.filter((n) => n.channel === "in_app").length,
      },
    });
  } catch (error: any) {
    console.error("Failed to load notifications:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "Failed to load notifications", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนทำรายการ", 401);
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id));

      return apiSuccess({ message: "อ่านการแจ้งเตือนทั้งหมดแล้ว" });
    }

    if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, session.user.id)
          )
        );

      return apiSuccess({ message: "อ่านการแจ้งเตือนแล้ว" });
    }

    return apiError("VALIDATION_ERROR", "ระบุ notificationId หรือ markAll", 400);
  } catch (error: any) {
    console.error("Failed to mark notifications read:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "Error updating notifications", 500);
  }
}
