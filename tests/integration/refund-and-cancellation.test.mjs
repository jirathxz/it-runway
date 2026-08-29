import test from "node:test";
import assert from "node:assert/strict";

function processCancellation({ registration, refundMethod, refundAccount, reason }) {
  if (registration.status === "completed") {
    throw new Error("Cannot cancel an event that has already completed");
  }
  if (registration.status === "cancelled") {
    throw new Error("Registration is already cancelled");
  }

  const refundReference = `REFUND-NP-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    success: true,
    registrationId: registration.id,
    newStatus: "cancelled",
    refundReference,
    refundAmount: registration.paidAmount || 650,
    refundMethod: refundMethod || "PromptPay",
    refundAccount: refundAccount || "Original Payment Channel",
    reason: reason || "ติดภารกิจด่วน",
    cancelledAt: new Date().toISOString(),
  };
}

test("Integration Test: Cancellation & Refund Flow", async (t) => {
  const mockUpcomingReg = {
    id: "reg-upcoming-101",
    bibNumber: "1088",
    status: "upcoming",
    paidAmount: 650,
  };

  await t.test("Cancelling upcoming registration generates refund reference and transitions status", () => {
    const result = processCancellation({
      registration: mockUpcomingReg,
      refundMethod: "PromptPay",
      refundAccount: "081-999-8888",
      reason: "ติดภารกิจ",
    });

    assert.equal(result.newStatus, "cancelled");
    assert.equal(result.refundAmount, 650);
    assert.ok(result.refundReference.startsWith("REFUND-NP-"));
    assert.equal(result.refundMethod, "PromptPay");
  });

  await t.test("Reject cancellation of already completed race", () => {
    const completedReg = { ...mockUpcomingReg, status: "completed" };
    assert.throws(() => {
      processCancellation({ registration: completedReg });
    }, /already completed/);
  });
});
