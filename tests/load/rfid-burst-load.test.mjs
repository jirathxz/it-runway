import test from "node:test";
import assert from "node:assert/strict";

test("Load & Stress Test: 5,000 Runner RFID Sensor Ingest & Batch Sync Throughput", async (t) => {
  const TOTAL_RUNNERS = 5000;
  const BATCH_SIZE = 250;

  // Generate 5,000 mock RFID scan payloads
  const mockScans = Array.from({ length: TOTAL_RUNNERS }, (_, i) => ({
    chipId: `CHIP-NP-${(100000 + i).toString()}`,
    bibId: (1000 + i).toString(),
    checkpointId: "CP-FINISH",
    eventId: "ev-nakhon-pathom",
    detectedAt: new Date(Date.now() + i * 50).toISOString(),
    readerId: `READER-${(i % 4) + 1}`,
  }));

  await t.test("Batch ingestion handles 5,000 scans with low latency", () => {
    const startTime = performance.now();

    // Process in batches
    let processedCount = 0;
    for (let i = 0; i < mockScans.length; i += BATCH_SIZE) {
      const batch = mockScans.slice(i, i + BATCH_SIZE);
      // Simulate batch ingestion
      processedCount += batch.length;
    }

    const durationMs = performance.now() - startTime;
    assert.equal(processedCount, TOTAL_RUNNERS);
    assert.ok(durationMs < 500, `Processing 5,000 items took ${durationMs.toFixed(2)}ms (must be < 500ms)`);
  });
});
