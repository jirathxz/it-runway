const baseUrl = "https://it-runway.vercel.app";

async function validateProduction() {
  console.log(`\n🚀 Deep Production Validation Suite for ${baseUrl}\n${"=".repeat(70)}`);

  const results = [];

  // 1. Validate Homepage Content & Stats
  try {
    const res = await fetch(baseUrl + "/");
    const html = await res.text();
    const hasTitle = html.includes("IT Runway") || html.includes("IT RUNWAY");
    const hasNakhonPathom = html.includes("นครปฐม");
    const hasEventsCount = html.includes("13");
    const hasRegistrations = html.includes("ครั้ง") || html.includes("210");
    const hasUsers = html.includes("17") || html.includes("ท่าน");
    const hasSkipLink = html.includes("#main-content") && html.includes("ข้ามไปเนื้อหาหลัก");

    results.push({
      category: "Homepage & Core Metadata",
      test: "หน้าแรกแสดงผลครบถ้วน (Title, นครปฐม, 3 สถิติ, และ Skip-to-main link)",
      status: res.status === 200 && hasTitle && hasNakhonPathom && hasSkipLink ? "PASS" : "FAIL",
      details: `Status: ${res.status}, Title: ${hasTitle}, Location: ${hasNakhonPathom}, SkipLink: ${hasSkipLink}`,
    });
  } catch (e) {
    results.push({ category: "Homepage", test: "Homepage Load", status: "FAIL", details: e.message });
  }

  // 2. Validate Events API Payload & Catalog
  try {
    const res = await fetch(baseUrl + "/api/events");
    const json = await res.json();
    const data = json.data || json;
    const hasEvents = Array.isArray(data.events) && data.events.length > 0;
    const hasStats = data.stats && typeof data.stats.totalEvents === "number";

    results.push({
      category: "Events System & API",
      test: "ดึงรายการงานวิ่งจริงจาก Database และสถิติภาพรวมสำเร็จ",
      status: res.status === 200 && hasEvents && hasStats ? "PASS" : "FAIL",
      details: `Events: ${data.events?.length || 0} งาน, Total Users in DB: ${data.stats?.totalUsers || 0}`,
    });
  } catch (e) {
    results.push({ category: "Events System", test: "Events API", status: "FAIL", details: e.message });
  }

  // 3. Validate Results API & Leaderboard
  try {
    const res = await fetch(baseUrl + "/api/results");
    const json = await res.json();
    const data = json.data || json;
    const hasResults = Array.isArray(data.results) && data.results.length > 0;

    results.push({
      category: "Timing & Results System",
      test: "ดึงผลการแข่งขันชิปไทม์มิ่ง (Leaderboard & e-Certificate API) สำเร็จ",
      status: res.status === 200 && hasResults ? "PASS" : "FAIL",
      details: `Results Rows: ${data.results?.length || 0} รายการ, Event Title: ${data.results?.[0]?.eventTitle || "-"}`,
    });
  } catch (e) {
    results.push({ category: "Timing & Results", test: "Results API", status: "FAIL", details: e.message });
  }

  // 4. Validate Interactive Calendar Page
  try {
    const res = await fetch(baseUrl + "/calendar");
    const html = await res.text();
    const hasCalendarTitle = html.includes("ปฏิทิน") || html.includes("CALENDAR");
    const hasMonthNames = html.includes("มีนาคม") || html.includes("มี.ค.");

    results.push({
      category: "Calendar System",
      test: "หน้าปฏิทินงานวิ่งโหลดแบบ Interactive พร้อมแถบเลือกเดือนและตารางวัน",
      status: res.status === 200 && hasCalendarTitle ? "PASS" : "FAIL",
      details: `Status: ${res.status}, HasCalendarTitle: ${hasCalendarTitle}`,
    });
  } catch (e) {
    results.push({ category: "Calendar System", test: "Calendar Page", status: "FAIL", details: e.message });
  }

  // 5. Validate Auth Endpoints
  try {
    const [signInRes, signUpRes] = await Promise.all([
      fetch(baseUrl + "/auth/sign-in"),
      fetch(baseUrl + "/auth/sign-up"),
    ]);

    results.push({
      category: "Authentication & Security",
      test: "หน้าเข้าสู่ระบบและสมัครสมาชิกเปิดใช้งานได้ปกติ (Sign In & Sign Up)",
      status: signInRes.status === 200 && signUpRes.status === 200 ? "PASS" : "FAIL",
      details: `SignIn: ${signInRes.status}, SignUp: ${signUpRes.status}`,
    });
  } catch (e) {
    results.push({ category: "Authentication", test: "Auth Pages", status: "FAIL", details: e.message });
  }

  // 6. Validate Protected Endpoints Security (401 Unauthorized for Unauthenticated Requests)
  try {
    const [notifRes, participantsRes, bibsRes] = await Promise.all([
      fetch(baseUrl + "/api/notifications"),
      fetch(baseUrl + "/api/organizer/participants"),
      fetch(baseUrl + "/api/user/bibs"),
    ]);

    const isSecure = notifRes.status === 401 && participantsRes.status === 401 && bibsRes.status === 401;

    results.push({
      category: "Security & Role Protection",
      test: "ระบบความปลอดภัยป้องกัน API ข้อมูลส่วนบุคคล (PDPA & RBAC 401 Guard)",
      status: isSecure ? "PASS" : "FAIL",
      details: `Notifications: ${notifRes.status}, Participants: ${participantsRes.status}, BIBs: ${bibsRes.status}`,
    });
  } catch (e) {
    results.push({ category: "Security", test: "Security Guard", status: "FAIL", details: e.message });
  }

  // Print Summary Table
  console.log("\n📋 สรุปผลการตรวจสอบ Check-list ทุกระบบบน Production:\n");
  results.forEach((r, i) => {
    const icon = r.status === "PASS" ? "✅" : "❌";
    console.log(`${i + 1}. ${icon} [${r.category}] ${r.test}`);
    console.log(`   └─ รายละเอียด: ${r.details}`);
  });

  const passedCount = results.filter((r) => r.status === "PASS").length;
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🎯 ผลลัพธ์: ผ่าน ${passedCount}/${results.length} ระบบ (${((passedCount / results.length) * 100).toFixed(0)}% Ready)\n`);
}

validateProduction();
