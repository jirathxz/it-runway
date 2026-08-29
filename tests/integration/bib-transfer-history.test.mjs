import test from "node:test";
import assert from "node:assert/strict";

// Simulate BIB Transfer Transaction
function executeBibTransfer({
  registration,
  fromUserId,
  toUserId,
  newRunnerName,
  reason,
}) {
  if (registration.status === "cancelled" || registration.status === "completed") {
    throw new Error(`Cannot transfer registration in status: ${registration.status}`);
  }

  const oldChip = registration.chipCode;
  const newChip = `CHIP-NP-${Math.floor(100000 + Math.random() * 900000)}`;

  // Mutated registration
  const updatedRegistration = {
    ...registration,
    userId: toUserId,
    chipCode: newChip,
    registrationStatus: "TRANSFERRED",
  };

  // Transfer history audit record
  const transferRecord = {
    id: "tx-uuid-1",
    registrationId: registration.id,
    fromUserId,
    toUserId,
    oldBib: registration.bibNumber,
    newBib: registration.bibNumber,
    oldChip,
    newChip,
    reason,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  return { updatedRegistration, transferRecord };
}

test("Integration Test: BIB Transfer & History Logging", async (t) => {
  const mockRegistration = {
    id: "reg-101",
    userId: "user-old",
    eventId: "ev-1",
    bibNumber: "1088",
    chipCode: "CHIP-OLD-001",
    status: "upcoming",
  };

  await t.test("Transfer reassigns user, generates new RFID chip code, and writes transfer record", () => {
    const { updatedRegistration, transferRecord } = executeBibTransfer({
      registration: mockRegistration,
      fromUserId: "user-old",
      toUserId: "user-new",
      newRunnerName: "ธนภัทร รุ่งเรือง",
      reason: "ติดภารกิจด่วน",
    });

    assert.equal(updatedRegistration.userId, "user-new");
    assert.notEqual(updatedRegistration.chipCode, "CHIP-OLD-001");
    assert.ok(updatedRegistration.chipCode.startsWith("CHIP-NP-"));
    assert.equal(transferRecord.oldChip, "CHIP-OLD-001");
    assert.equal(transferRecord.newChip, updatedRegistration.chipCode);
    assert.equal(transferRecord.status, "COMPLETED");
  });

  await t.test("Transfer rejects cancelled or completed registrations", () => {
    const cancelledReg = { ...mockRegistration, status: "cancelled" };
    assert.throws(() => {
      executeBibTransfer({
        registration: cancelledReg,
        fromUserId: "user-old",
        toUserId: "user-new",
        newRunnerName: "ธนภัทร รุ่งเรือง",
        reason: "โอนสิทธิ์",
      });
    }, /Cannot transfer/);
  });
});
