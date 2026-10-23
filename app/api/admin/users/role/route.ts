import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
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
    const { targetUserId, newRole } = body;

    if (!targetUserId || !newRole || !["admin", "member", "user"].includes(newRole)) {
      return apiError(
        "VALIDATION_ERROR",
        "พารามิเตอร์ไม่ถูกต้อง (ต้องการ targetUserId และ newRole: admin หรือ member)",
        400
      );
    }

    if (targetUserId === session.user.id && newRole !== "admin") {
      return apiError(
        "VALIDATION_ERROR",
        "ไม่สามารถลดระดับสิทธิ์ของตนเองได้ เพื่อความปลอดภัยของระบบ",
        400
      );
    }

    const [targetUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return apiError("RESOURCE_NOT_FOUND", "ไม่พบข้อมูลสมาชิกในระบบ", 404);
    }

    const normalizedRole = newRole === "member" ? "user" : newRole;

    const [updatedUser] = await db
      .update(user)
      .set({
        role: normalizedRole,
        updatedAt: new Date(),
      })
      .where(eq(user.id, targetUserId))
      .returning();

    await recordAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: "admin",
      action: "ADMIN_CHANGE_USER_ROLE",
      entityType: "user",
      entityId: targetUserId,
      fromState: (targetUser as any).role || "user",
      toState: normalizedRole,
      ipAddress: ip,
      userAgent: userAgent,
      details: {
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
        assignedRole: normalizedRole,
      },
    });

    return apiSuccess({
      message: `ปรับระดับสิทธิ์ของ "${updatedUser.name}" เป็น ${normalizedRole === "admin" ? "แอดมิน (Admin)" : "สมาชิกทั่วไป (Member)"} สำเร็จแล้ว`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("Admin update user role error:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error.message || "เกิดข้อผิดพลาดในการปรับระดับสิทธิ์",
      500
    );
  }
}
