import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        isLoggedIn: false,
        role: "guest",
        isOrganizer: false,
        isAdmin: false,
        organizedEvents: [],
      });
    }

    const isAdmin = (session.user as any)?.role === "admin";

    // Query events organized by this user that are approved
    const allEvents = await db.select().from(events);
    const userApprovedEvents = allEvents.filter(
      (ev) => ev.organizerId === session.user.id && ev.approvalStatus === "approved"
    );

    const isOrganizer = userApprovedEvents.length > 0 || isAdmin;

    const role = isAdmin
      ? "admin"
      : isOrganizer
      ? "organizer"
      : "member";

    return NextResponse.json({
      isLoggedIn: true,
      role, // "admin" | "organizer" | "member"
      roleLabel: isAdmin ? "แอดมิน" : isOrganizer ? "ผู้จัดงาน" : "สมาชิก",
      isOrganizer,
      isAdmin,
      organizedEvents: userApprovedEvents,
    });
  } catch (error: any) {
    console.error("Failed to check organizer status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
