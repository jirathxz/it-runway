import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has linked Google Account
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, session.user.id));

    const googleAcc = accounts.find((a) => a.providerId === "google");
    const isGoogleUser = Boolean(googleAcc || session.user.email?.endsWith("@gmail.com"));

    // Extract genuine Google profile picture from Google OAuth id_token or session
    let googleImage: string | null = null;
    if (googleAcc?.idToken && googleAcc.idToken.includes(".")) {
      try {
        const parts = googleAcc.idToken.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.picture) {
          googleImage = payload.picture.replace(/=s\d+(-c)?$/, "=s384-c");
        }
      } catch (err) {
        console.error("Failed to decode Google id_token:", err);
      }
    }

    if (!googleImage && session.user.image?.includes("googleusercontent.com")) {
      googleImage = session.user.image.replace(/=s\d+(-c)?$/, "=s384-c");
    }

    if (!googleImage && userData.image?.includes("googleusercontent.com")) {
      googleImage = userData.image.replace(/=s\d+(-c)?$/, "=s384-c");
    }

    // High quality Google user photo default
    if (!googleImage && isGoogleUser) {
      googleImage = `https://lh3.googleusercontent.com/a/ACg8ocJRBVZclR-jKT3q9nwAtgZ0LHhLbiFq5boFu6An3FaYeZxEqDb3=s384-c`;
    }

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      isGoogleUser,
      googleImage,
      role: userData.role || "user",
      phone: userData.phoneNumber || "",
      gender: userData.gender || "",
      birthdate: userData.birthdate || "",
      bloodType: userData.bloodType || "O+",
      emergencyName: userData.emergencyName || "",
      emergencyPhone: userData.emergencyPhone || "",
      medicalConditions: userData.medicalConditions || "",
      tshirtSize: userData.tshirtSize || "L",
      preferredDistance: userData.preferredDistance || "21K",
      runningClub: userData.runningClub || "",
      targetPace: userData.targetPace || "",
      chipCode: userData.chipCode || `RFID-TH-73000-${userData.id.slice(-4).toUpperCase()}`,
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateFields.name = body.name || session.user.name;
    if (body.image !== undefined) updateFields.image = body.image;
    if (body.phone !== undefined) updateFields.phoneNumber = body.phone;
    if (body.gender !== undefined) updateFields.gender = body.gender;
    if (body.birthdate !== undefined) updateFields.birthdate = body.birthdate;
    if (body.bloodType !== undefined) updateFields.bloodType = body.bloodType;
    if (body.emergencyName !== undefined) updateFields.emergencyName = body.emergencyName;
    if (body.emergencyPhone !== undefined) updateFields.emergencyPhone = body.emergencyPhone;
    if (body.medicalConditions !== undefined) updateFields.medicalConditions = body.medicalConditions;
    if (body.tshirtSize !== undefined) updateFields.tshirtSize = body.tshirtSize;
    if (body.preferredDistance !== undefined) updateFields.preferredDistance = body.preferredDistance;
    if (body.runningClub !== undefined) updateFields.runningClub = body.runningClub;
    if (body.targetPace !== undefined) updateFields.targetPace = body.targetPace;

    await db
      .update(user)
      .set(updateFields)
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, image: updateFields.image });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
