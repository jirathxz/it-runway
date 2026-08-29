const baseUrl = "https://it-runway.vercel.app";
const endpoints = [
  { path: "/", expected: 200, name: "หน้าแรก (Homepage)" },
  { path: "/events", expected: 200, name: "ค้นหางานวิ่ง (Events Catalog)" },
  { path: "/calendar", expected: 200, name: "ปฏิทินงานวิ่ง (Interactive Calendar)" },
  { path: "/results", expected: 200, name: "ผลการแข่งขัน & e-Certificate (Results Live)" },
  { path: "/organize", expected: 200, name: "ยื่นขอจัดงานวิ่ง (Organizer Portal)" },
  { path: "/auth/sign-in", expected: 200, name: "เข้าสู่ระบบ (Sign In)" },
  { path: "/auth/sign-up", expected: 200, name: "สมัครสมาชิก (Sign Up)" },
  { path: "/api/events", expected: 200, name: "API: งานวิ่ง & สถิติ (Events Data API)" },
  { path: "/api/results", expected: 200, name: "API: ผลการแข่งขัน (Results Data API)" },
  { path: "/api/notifications", expected: 401, name: "API: Notification (Secure 401 Protected)" },
  { path: "/api/organizer/participants", expected: 401, name: "API: Organizer Participants (Secure 401 Protected)" },
  { path: "/api/user/bibs", expected: 401, name: "API: User BIBs (Secure 401 Protected)" },
];

async function runHealthCheck() {
  console.log(`\n🔍 เริ่มต้นทดสอบ Live Production Endpoints: ${baseUrl}\n${"=".repeat(65)}`);
  let allPass = true;
  let successCount = 0;

  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(baseUrl + ep.path);
      const elapsed = Date.now() - start;
      const pass = res.status === ep.expected;
      if (pass) {
        successCount++;
      } else {
        allPass = false;
      }
      const icon = pass ? "✅ PASS" : "❌ FAIL";
      console.log(`${icon} [${res.status} | คาดหวัง ${ep.expected}] ${ep.name} -> ${ep.path} (${elapsed}ms)`);
    } catch (e) {
      allPass = false;
      console.log(`❌ ERROR ${ep.name} -> ${ep.path}: ${e.message}`);
    }
  }

  console.log(`${"=".repeat(65)}\n📊 สรุปผลการทดสอบ: ผ่าน ${successCount}/${endpoints.length} รายการ (${allPass ? "สมบูรณ์ 100%" : "พบข้อผิดพลาด"})\n`);
}

runHealthCheck();
