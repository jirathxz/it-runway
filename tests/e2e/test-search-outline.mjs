import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_URL || "https://it-runway.vercel.app";

async function testSearchOutline() {
  console.log(`\n🔍 Running Playwright Search Modal Input Outline Verification on: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  
  // Test Desktop & Mobile
  const viewports = [
    { name: "Desktop (1280x800)", width: 1280, height: 800, isMobile: false },
    { name: "Mobile (iPhone 16 Pro Max)", width: 440, height: 956, isMobile: true },
  ];

  for (const vp of viewports) {
    console.log(`📱 Testing Viewport: ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });

    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });

    // Open Search dialog using keyboard shortcut Control+K / Meta+K
    await page.keyboard.down("Control");
    await page.keyboard.press("k");
    await page.keyboard.up("Control");

    await page.waitForTimeout(800);

    // Locate the search input inside SearchCommandDialog
    const searchInput = page.locator('input[placeholder*="ค้นหาชื่องานวิ่ง, ระยะทาง"]');
    await searchInput.waitFor({ state: "visible", timeout: 10000 });
    
    // Focus the input
    await searchInput.focus();
    await page.waitForTimeout(400);

    // Check computed styles on the focused input
    const styles = await searchInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        outlineColor: computed.outlineColor,
        borderTopWidth: computed.borderTopWidth,
        borderRightWidth: computed.borderRightWidth,
        borderBottomWidth: computed.borderBottomWidth,
        borderLeftWidth: computed.borderLeftWidth,
        boxShadow: computed.boxShadow,
      };
    });

    console.log(`  📊 [${vp.name}] Computed styles on focused search input:`, styles);

    // Assert NO yellow outline or border
    assert.ok(
      styles.outlineWidth === "0px" || styles.outlineStyle === "none",
      `Expected outline to be 0px or none, got: ${styles.outlineWidth} ${styles.outlineStyle}`
    );
    assert.ok(
      styles.borderTopWidth === "0px",
      `Expected borderTopWidth to be 0px, got: ${styles.borderTopWidth}`
    );

    // Capture screenshot of the focused input area
    const screenshotPath = `tests/e2e/search-modal-${vp.isMobile ? "mobile" : "desktop"}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`  📸 Screenshot saved to: ${screenshotPath}`);

    await context.close();
  }

  await browser.close();
  console.log("\n=======================================================");
  console.log("🎉 ALL CHECKS PASSED: Search input has NO yellow outline!");
  console.log("=======================================================\n");
}

testSearchOutline().catch((err) => {
  console.error("❌ Playwright Check Failed:", err);
  process.exit(1);
});
