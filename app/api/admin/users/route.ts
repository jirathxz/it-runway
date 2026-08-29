import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, events, registrations } from "@/lib/schema";
import { desc } from "drizzle-orm";

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

    const allUsers = await db.select().from(user).orderBy(desc(user.createdAt));
    const allEvents = await db.select().from(events);
    const allRegs = await db.select().from(registrations);

    // Map organized events per user
    const organizedMap = new Map<string, any[]>();
    for (const ev of allEvents) {
      if (ev.organizerId) {
        const list = organizedMap.get(ev.organizerId) || [];
        list.push(ev);
        organizedMap.set(ev.organizerId, list);
      }
    }

    // Map registrations per user
    const regMap = new Map<string, number>();
    for (const r of allRegs) {
      regMap.set(r.userId, (regMap.get(r.userId) || 0) + 1);
    }

    const enrichedUsers = allUsers.map((u) => {
      const userOrganized = organizedMap.get(u.id) || [];
      const approvedOrganized = userOrganized.filter((e) => e.approvalStatus === "approved");
      const isAdmin = (u as any).role === "admin";
      const isOrganizer = approvedOrganized.length > 0;

      let effectiveRole = "member";
      let roleBadge = "สมาชิก";

      if (isAdmin) {
        effectiveRole = "admin";
        roleBadge = "แอดมิน";
      } else if (isOrganizer) {
        effectiveRole = "organizer";
        roleBadge = "ผู้จัดงาน";
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        createdAt: u.createdAt,
        role: (u as any).role || "member",
        effectiveRole,
        roleBadge,
        registeredCount: regMap.get(u.id) || 0,
        organizedCount: userOrganized.length,
        approvedOrganizedCount: approvedOrganized.length,
        organizedEvents: userOrganized,
      };
    });

    return NextResponse.json({
      users: enrichedUsers,
      stats: {
        totalUsers: enrichedUsers.length,
        adminsCount: enrichedUsers.filter((u) => u.effectiveRole === "admin").length,
        organizersCount: enrichedUsers.filter((u) => u.effectiveRole === "organizer").length,
        membersCount: enrichedUsers.filter((u) => u.effectiveRole === "member").length,
      },
    });
  } catch (error: any) {
    console.error("Failed to load admin users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load users" },
      { status: 500 }
    );
  }
}
