import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, user, events, bibTransfers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการโอนสิทธิ์ BIB" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      registrationId,
      newRunnerName,
      newRunnerPhone,
      newRunnerEmail,
      newGender,
      newEmergencyName,
      newEmergencyPhone,
      newMedicalConditions,
      transferReason,
    } = body;

    if (!registrationId || !newRunnerName || !newRunnerPhone || !newEmergencyName || !newEmergencyPhone) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลผู้รับโอนสิทธิ์ให้ครบถ้วน (ชื่อ, เบอร์โทร, ข้อมูลติดต่อฉุกเฉิน)" },
        { status: 400 }
      );
    }

    // Find the registration
    const regList = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการลงทะเบียนนี้" },
        { status: 404 }
      );
    }

    const reg = regList[0];
    const isAdmin = (session.user as any)?.role === "admin";

    // Only the owner of the registration or admin can transfer
    if (reg.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์โอนสิทธิ์ BIB ของผู้อื่น" },
        { status: 403 }
      );
    }

    if (reg.status === "cancelled") {
      return NextResponse.json(
        { error: "ไม่สามารถโอนสิทธิ์รายการที่ยกเลิกไปแล้วได้" },
        { status: 400 }
      );
    }

    if (reg.checkedIn === "yes") {
      return NextResponse.json(
        { error: "ไม่สามารถโอนสิทธิ์ BIB ที่ทำการเช็คอินรับอุปกรณ์ไปแล้วได้" },
        { status: 400 }
      );
    }

    // Check if new recipient exists by email or phone
    let targetUserId = reg.userId;
    if (newRunnerEmail && newRunnerEmail.trim() !== "") {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, newRunnerEmail.trim().toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        targetUserId = existingUser[0].id;
      }
    }

    // Update registration ownership or details
    // If target user exists, assign userId = targetUserId;
    // Generate new RFID chip code with transfer suffix
    const updatedChipCode = `NP-TRF-${Math.floor(100000 + Math.random() * 900000)}`;

    await db
      .update(registrations)
      .set({
        userId: targetUserId,
        chipCode: updatedChipCode,
        registrationStatus: "TRANSFERRED",
      })
      .where(eq(registrations.id, registrationId));

    // Insert full BIB_TRANSFER history record
    await db.insert(bibTransfers).values({
      registrationId: reg.id,
      fromUserId: session.user.id,
      toUserId: targetUserId,
      oldBib: reg.bibNumber,
      newBib: reg.bibNumber,
      oldChip: reg.chipCode,
      newChip: updatedChipCode,
      reason: transferReason || "โอนสิทธิ์ให้นักวิ่งท่านอื่น",
      status: "COMPLETED",
      createdAt: new Date(),
      completedAt: new Date(),
    });

    // If new user was found, update their profile with emergency data if missing
    if (targetUserId !== reg.userId) {
      await db
        .update(user)
        .set({
          name: newRunnerName,
          phoneNumber: newRunnerPhone,
          gender: newGender || "male",
          emergencyName: newEmergencyName,
          emergencyPhone: newEmergencyPhone,
          medicalConditions: newMedicalConditions || "ไม่มีโรคประจำตัว",
        })
        .where(eq(user.id, targetUserId));
    }

    return NextResponse.json({
      success: true,
      message: `โอนสิทธิ์ BIB ${reg.bibNumber} ให้แก่คุณ ${newRunnerName} สำเร็จแล้ว`,
      bibNumber: reg.bibNumber,
      transferredTo: newRunnerName,
      newChipCode: updatedChipCode,
    });
  } catch (error: any) {
    console.error("Failed to transfer BIB:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการโอนสิทธิ์ BIB" },
      { status: 500 }
    );
  }
}
