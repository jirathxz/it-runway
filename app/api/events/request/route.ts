import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอจัดงานวิ่ง" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      location,
      date,
      time,
      distance,
      price,
      image,
      organizerName,
      organizerContact,
    } = body;

    if (!title || !location || !date || !distance) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลงานวิ่งที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Parse date and time
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: "รูปแบบวันที่จัดงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price) || 0;

    const [newEvent] = await db
      .insert(events)
      .values({
        title: title.trim(),
        location: location.trim(),
        date: eventDate,
        distance: distance.trim(),
        price: parsedPrice,
        status: "upcoming",
        image: image || "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
        organizerId: session.user.id,
        organizerName: organizerName || session.user.name || "สมาชิก IT Runway",
        organizerContact: organizerContact || session.user.email || "",
        approvalStatus: "pending", // Waiting for admin approval
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "ส่งคำขอจัดงานวิ่งสำเร็จ อยู่ระหว่างการพิจารณาอนุมัติโดยแอดมิน",
      event: newEvent,
    });
  } catch (error: any) {
    console.error("Failed to submit event request:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการส่งคำขอจัดงาน" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ requests: [] });
    }

    // Return requests submitted by this user
    const rows = await db
      .select()
      .from(events)
      .where(events.organizerId ? (events.organizerId as any) : undefined);

    const userRequests = rows.filter((r) => r.organizerId === session.user.id);

    return NextResponse.json({ requests: userRequests });
  } catch (error: any) {
    console.error("Failed to get user event requests:", error);
    return NextResponse.json({ requests: [] });
  }
}
