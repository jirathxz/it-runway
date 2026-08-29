import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "พื้นที่สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { eventId, action, reason } = body; // action: "approve" | "reject"

    if (!eventId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "พารามิเตอร์ไม่ถูกต้อง (ต้องการ eventId และ action)" },
        { status: 400 }
      );
    }

    const newApprovalStatus = action === "approve" ? "approved" : "rejected";
    const newEventStatus = action === "approve" ? "open" : "cancelled";

    const [updatedEvent] = await db
      .update(events)
      .set({
        approvalStatus: newApprovalStatus,
        status: newEventStatus,
      })
      .where(eq(events.id, eventId))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "ไม่พบงานวิ่งที่ระบุ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? `อนุมัติงานวิ่ง "${updatedEvent.title}" เรียบร้อยแล้ว สมาชิกผู้ขอจัดได้รับสิทธิ์ผู้จัดงานและเปิดระบบตรวจ BIB ทันที`
          : `ปฏิเสธคำขอจัดงานวิ่ง "${updatedEvent.title}" เรียบร้อยแล้ว`,
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Admin event action error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการประมวลผล" },
      { status: 500 }
    );
  }
}
