import test from "node:test";
import assert from "node:assert/strict";

// Simulate offline conflict resolution algorithm
function resolveCheckinConflict(serverRecord, offlineScan) {
  // Rule 1: Earliest Timestamp Preservation
  if (serverRecord.checkedIn === "yes") {
    const serverTime = new Date(serverRecord.checkedInAt).getTime();
    const offlineTime = new Date(offlineScan.scannedAt).getTime();

    if (offlineTime < serverTime) {
      return {
        action: "UPDATE_TIMESTAMP",
        checkedInAt: offlineScan.scannedAt,
        conflict: false,
        reason: "Offline scan occurred earlier than server scan",
      };
    } else {
      return {
        action: "KEEP_SERVER",
        checkedInAt: serverRecord.checkedInAt,
        conflict: false,
        reason: "Server scan was already earlier (Idempotency)",
      };
    }
  }

  // Rule 2: Registration Cancelled / Transferred Conflict Flag
  if (serverRecord.status === "cancelled" || serverRecord.status === "transferred") {
    return {
      action: "FLAG_CONFLICT",
      conflict: true,
      reason: `BIB status on server is ${serverRecord.status.toUpperCase()} during offline scan`,
    };
  }

  // Rule 3: Normal successful sync
  return {
    action: "APPLY_CHECKIN",
    checkedInAt: offlineScan.scannedAt,
    conflict: false,
    reason: "Fresh checkin applied",
  };
}

test("Offline Sync Test: Conflict Resolution Engine", async (t) => {
  await t.test("should apply fresh check-in when server record is not checked in", () => {
    const serverRecord = { id: "reg-1", bibNumber: "1088", checkedIn: "no", status: "upcoming" };
    const offlineScan = { registrationId: "reg-1", scannedAt: "2026-11-15T05:12:00.000Z" };

    const resolution = resolveCheckinConflict(serverRecord, offlineScan);
    assert.equal(resolution.action, "APPLY_CHECKIN");
    assert.equal(resolution.conflict, false);
  });

  await t.test("should preserve earliest timestamp when offline scan occurred first", () => {
    const serverRecord = {
      id: "reg-1",
      bibNumber: "1088",
      checkedIn: "yes",
      checkedInAt: "2026-11-15T05:20:00.000Z",
      status: "upcoming",
    };
    const offlineScan = {
      registrationId: "reg-1",
      scannedAt: "2026-11-15T05:10:00.000Z", // 10 minutes earlier
    };

    const resolution = resolveCheckinConflict(serverRecord, offlineScan);
    assert.equal(resolution.action, "UPDATE_TIMESTAMP");
    assert.equal(resolution.checkedInAt, "2026-11-15T05:10:00.000Z");
  });

  await t.test("should flag conflict if BIB was cancelled or transferred during offline window", () => {
    const serverRecord = {
      id: "reg-2",
      bibNumber: "2044",
      checkedIn: "no",
      status: "cancelled",
    };
    const offlineScan = {
      registrationId: "reg-2",
      scannedAt: "2026-11-15T05:15:00.000Z",
    };

    const resolution = resolveCheckinConflict(serverRecord, offlineScan);
    assert.equal(resolution.action, "FLAG_CONFLICT");
    assert.equal(resolution.conflict, true);
    assert.ok(resolution.reason.includes("CANCELLED"));
  });
});
