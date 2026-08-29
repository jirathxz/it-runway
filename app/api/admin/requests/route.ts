import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, user } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
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

    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));

    // Get all users for organizer mapping
    const allUsers = await db.select().from(user);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const enrichedRequests = allEvents.map((ev) => {
      const organizer = ev.organizerId ? userMap.get(ev.organizerId) : null;
      return {
        ...ev,
        organizer: organizer
          ? {
              id: organizer.id,
              name: organizer.name,
              email: organizer.email,
              image: organizer.image,
            }
          : null,
      };
    });

    const pendingRequests = enrichedRequests.filter((r) => r.approvalStatus === "pending");
    const approvedRequests = enrichedRequests.filter((r) => r.approvalStatus === "approved");
    const rejectedRequests = enrichedRequests.filter((r) => r.approvalStatus === "rejected");

    return NextResponse.json({
      requests: enrichedRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      stats: {
        total: enrichedRequests.length,
        pendingCount: pendingRequests.length,
        approvedCount: approvedRequests.length,
        rejectedCount: rejectedRequests.length,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch admin requests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load requests" },
      { status: 500 }
    );
  }
}
