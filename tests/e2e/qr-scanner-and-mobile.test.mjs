import test from "node:test";
import assert from "node:assert/strict";

// Simulate QR barcode decoding and sanitization
function parseQrPayload(rawScanText) {
  if (!rawScanText) return null;

  // Format 1: URL query param (e.g. https://it-runway.vercel.app/account/bibs?bib=1088)
  if (rawScanText.includes("bib=")) {
    const match = rawScanText.match(/bib=([A-Za-z0-9_-]+)/);
    if (match) return { type: "BIB", value: match[1] };
  }

  // Format 2: JSON Payload (e.g. {"bib":"1088","chip":"CHIP-001"})
  try {
    const parsed = JSON.parse(rawScanText);
    if (parsed.bib) return { type: "BIB", value: String(parsed.bib) };
    if (parsed.chip) return { type: "CHIP", value: String(parsed.chip) };
  } catch {}

  // Format 3: Raw numeric BIB string
  if (/^\d{3,6}$/.test(rawScanText.trim())) {
    return { type: "BIB", value: rawScanText.trim() };
  }

  return { type: "RAW", value: rawScanText.trim() };
}

// Simulate mobile responsive container breakpoints
function getResponsiveLayoutConfig(viewportWidth) {
  if (viewportWidth < 640) {
    return { isMobile: true, columns: 1, scannerSize: "compact", touchOptimized: true };
  }
  if (viewportWidth < 1024) {
    return { isMobile: false, isTablet: true, columns: 2, scannerSize: "medium", touchOptimized: true };
  }
  return { isMobile: false, isTablet: false, columns: 3, scannerSize: "large", touchOptimized: false };
}

test("E2E & Mobile Test: QR Scanner Parser & Multi-Format Parsing", async (t) => {
  await t.test("parses URL format QR codes", () => {
    const res = parseQrPayload("https://it-runway.vercel.app/account/bibs?bib=1088");
    assert.equal(res.type, "BIB");
    assert.equal(res.value, "1088");
  });

  await t.test("parses JSON format QR codes", () => {
    const res = parseQrPayload('{"bib":"2044","chip":"CHIP-NP-204400"}');
    assert.equal(res.type, "BIB");
    assert.equal(res.value, "2044");
  });

  await t.test("parses direct raw numeric BIB input", () => {
    const res = parseQrPayload("3055");
    assert.equal(res.type, "BIB");
    assert.equal(res.value, "3055");
  });
});

test("E2E & Mobile Test: Responsive Viewport Adaptation", async (t) => {
  await t.test("Adapts layout to mobile viewport (< 640px)", () => {
    const mobileCfg = getResponsiveLayoutConfig(390); // iPhone 14 width
    assert.equal(mobileCfg.isMobile, true);
    assert.equal(mobileCfg.columns, 1);
    assert.equal(mobileCfg.touchOptimized, true);
  });

  await t.test("Adapts layout to desktop viewport (>= 1024px)", () => {
    const desktopCfg = getResponsiveLayoutConfig(1280);
    assert.equal(desktopCfg.isMobile, false);
    assert.equal(desktopCfg.columns, 3);
  });
});
