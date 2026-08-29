import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { user } from "../lib/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Creating Demo Users via Better Auth API...");

  // 1. Create Member: user-runway
  try {
    const memberRes = await auth.api.signUpEmail({
      body: {
        email: "user-runway@it-runway.com",
        password: "user-runway",
        name: "user-runway",
      },
    });
    console.log("Member user-runway created/registered:", memberRes);
  } catch (e: any) {
    console.log("Member registration note:", e?.message || e);
  }

  // 2. Create Admin: admin-runway
  try {
    const adminRes = await auth.api.signUpEmail({
      body: {
        email: "admin-runway@it-runway.com",
        password: "admin-runway",
        name: "admin-runway",
      },
    });
    console.log("Admin admin-runway created/registered:", adminRes);
  } catch (e: any) {
    console.log("Admin registration note:", e?.message || e);
  }

  // 3. Mark email_verified = true and set roles
  console.log("Updating email verification and roles in database...");
  await db
    .update(user)
    .set({
      emailVerified: true,
      role: "user",
    })
    .where(eq(user.email, "user-runway@it-runway.com"));

  await db
    .update(user)
    .set({
      emailVerified: true,
      role: "admin",
    })
    .where(eq(user.email, "admin-runway@it-runway.com"));

  console.log("✅ Demo users successfully seeded!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error in create-demo-users:", err);
  process.exit(1);
});
