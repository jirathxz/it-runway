import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_URL || "https://it-runway.vercel.app";

async function runPlaywrightCheck() {
  console.log(`\n🚀 Starting Playwright Responsive & Functional Check on: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  const viewports = [
    { name: "Mobile (iPhone 14)", width: 390, height: 844, isMobile: true },
    { name: "Tablet (iPad Mini)", width: 768, height: 1024, isMobile: true },
    { name: "Desktop (Laptop/Monitor)", width: 1280, height: 800, isMobile: false },
  ];

  for (const vp of viewports) {
    console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      userAgent: vp.isMobile
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 1. Check Homepage
    const resHome = await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    const homeStatus = resHome?.status() ?? 0;
    console.log(`  ✓ Homepage HTTP Status: ${homeStatus}`);
    assert.ok(homeStatus === 200, `Homepage returned ${homeStatus}`);

    // Check H1 title exists
    const h1Text = await page.locator("h1").first().textContent();
    console.log(`  ✓ Hero H1 content: "${h1Text?.replace(/\s+/g, " ").trim()}"`);

    // Check navbar
    if (vp.isMobile && vp.width < 1024) {
      const hamburger = page.locator('button[aria-controls="mobile-navigation-drawer"]');
      const isHamburgerVisible = await hamburger.isVisible();
      console.log(`  ✓ Mobile Hamburger Button visible: ${isHamburgerVisible}`);
      assert.ok(isHamburgerVisible, "Mobile hamburger button should be visible on mobile/tablet");

      // Test opening mobile menu drawer
      await hamburger.click();
      await page.waitForTimeout(400);
      const drawer = page.locator("#mobile-navigation-drawer");
      const drawerVisible = await drawer.isVisible();
      console.log(`  ✓ Mobile Navigation Drawer expands: ${drawerVisible}`);
    } else {
      const desktopNav = page.locator('nav[aria-label="เมนูหลัก"]');
      const isDesktopNavVisible = await desktopNav.isVisible();
      console.log(`  ✓ Desktop Navigation visible: ${isDesktopNavVisible}`);
      assert.ok(isDesktopNavVisible, "Desktop navigation should be visible on desktop");
    }

    // 2. Check Calendar Page
    const resCal = await page.goto(`${BASE_URL}/calendar`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const calStatus = resCal?.status() ?? 0;
    console.log(`  ✓ /calendar HTTP Status: ${calStatus}`);
    assert.ok(calStatus === 200, `/calendar returned ${calStatus}`);

    // 3. Check Events Page
    const resEvents = await page.goto(`${BASE_URL}/events`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const eventsStatus = resEvents?.status() ?? 0;
    console.log(`  ✓ /events HTTP Status: ${eventsStatus}`);
    assert.ok(eventsStatus === 200, `/events returned ${eventsStatus}`);

    // 4. Check Results Page
    const resResults = await page.goto(`${BASE_URL}/results`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const resultsStatus = resResults?.status() ?? 0;
    console.log(`  ✓ /results HTTP Status: ${resultsStatus}`);
    assert.ok(resultsStatus === 200, `/results returned ${resultsStatus}`);

    await context.close();
    results.push({ viewport: vp.name, status: "PASSED" });
  }

  await browser.close();
  console.log("\n=======================================================");
  console.log("🎉 ALL PLAYWRIGHT RESPONSIVE CHECKS PASSED SUCCESSFULLY!");
  console.log("=======================================================\n");
  console.table(results);
}

runPlaywrightCheck().catch((err) => {
  console.error("❌ Playwright Check Failed:", err);
  process.exit(1);
});
