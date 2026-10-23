import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { apiSuccess, apiError } from "@/lib/api-response";

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
      phoneNumber: userData.phoneNumber || "",
      gender: userData.gender || "male",
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
      consentPdpaAt: userData.consentPdpaAt,
      medicalConsentGiven: userData.medicalConsentGiven ?? true,
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

    const body = await req.json().catch(() => ({}));

    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Name handling
    if (body.name !== undefined) {
      const trimmedName = typeof body.name === "string" ? body.name.trim() : "";
      updateFields.name = trimmedName || session.user.name || "นักวิ่ง IT Runway";
    }

    // Profile Image
    if (body.image !== undefined) {
      updateFields.image = body.image || null;
    }

    // Phone number handling (accept both body.phone and body.phoneNumber, sanitize blank to null)
    if (body.phone !== undefined || body.phoneNumber !== undefined) {
      const rawPhone = body.phone !== undefined ? body.phone : body.phoneNumber;
      const cleanPhone = typeof rawPhone === "string" ? rawPhone.trim() : "";
      updateFields.phoneNumber = cleanPhone.length > 0 ? cleanPhone : null;
    }

    // Runner Demographics & Health Info
    if (body.gender !== undefined) {
      updateFields.gender = typeof body.gender === "string" ? body.gender.trim() : "male";
    }
    if (body.birthdate !== undefined) {
      updateFields.birthdate = typeof body.birthdate === "string" ? body.birthdate.trim() : "";
    }
    if (body.bloodType !== undefined) {
      updateFields.bloodType = typeof body.bloodType === "string" ? body.bloodType.trim() : "O+";
    }
    if (body.emergencyName !== undefined) {
      updateFields.emergencyName = typeof body.emergencyName === "string" ? body.emergencyName.trim() : "";
    }
    if (body.emergencyPhone !== undefined) {
      updateFields.emergencyPhone = typeof body.emergencyPhone === "string" ? body.emergencyPhone.trim() : "";
    }
    if (body.medicalConditions !== undefined) {
      updateFields.medicalConditions = typeof body.medicalConditions === "string" ? body.medicalConditions.trim() : "";
    }

    // Runner Gear & Preferences
    if (body.tshirtSize !== undefined) {
      updateFields.tshirtSize = typeof body.tshirtSize === "string" ? body.tshirtSize.trim() : "L";
    }
    if (body.preferredDistance !== undefined) {
      updateFields.preferredDistance = typeof body.preferredDistance === "string" ? body.preferredDistance.trim() : "21K";
    }
    if (body.runningClub !== undefined) {
      updateFields.runningClub = typeof body.runningClub === "string" ? body.runningClub.trim() : "";
    }
    if (body.targetPace !== undefined) {
      updateFields.targetPace = typeof body.targetPace === "string" ? body.targetPace.trim() : "";
    }
    if (body.chipCode !== undefined && body.chipCode) {
      updateFields.chipCode = typeof body.chipCode === "string" ? body.chipCode.trim() : "";
    }

    // PDPA & Consent
    updateFields.consentPdpaAt = new Date();
    if (body.consentPdpaVersion !== undefined) {
      updateFields.consentPdpaVersion = body.consentPdpaVersion;
    }
    if (body.medicalConsentGiven !== undefined) {
      updateFields.medicalConsentGiven = Boolean(body.medicalConsentGiven);
    }

    await db
      .update(user)
      .set(updateFields)
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลโปรไฟล์สำเร็จ",
      data: updateFields,
      image: updateFields.image,
    });
  } catch (error: any) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
