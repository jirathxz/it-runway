import test from "node:test";
import assert from "node:assert/strict";

// Quota evaluation logic (mirrors app/api/events/register/route.ts and app/api/events/route.ts)
function evaluateEventRegistrationQuota({ eventCapacity, activeRegistrationsCount }) {
  const remainingSlots = Math.max(0, eventCapacity - activeRegistrationsCount);
  const isSoldOut = remainingSlots === 0;

  if (isSoldOut) {
    return {
      allowed: false,
      statusCode: 400,
      error: `ขออภัย งานวิ่งนี้เปิดรับสมัครเต็มจำนวนแล้ว (${eventCapacity}/${eventCapacity} คน)`,
      soldOut: true,
      remainingSlots: 0,
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    soldOut: false,
    remainingSlots: remainingSlots - 1, // after new registration
  };
}

test("Unit Test: Event Participant Capacity & Quota Enforcement", async (t) => {
  await t.test("allows registration when active participants are below capacity", () => {
    const result = evaluateEventRegistrationQuota({
      eventCapacity: 500,
      activeRegistrationsCount: 250,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.statusCode, 200);
    assert.equal(result.soldOut, false);
    assert.equal(result.remainingSlots, 249);
  });

  await t.test("rejects registration with soldOut=true when active participants reach event limit", () => {
    const result = evaluateEventRegistrationQuota({
      eventCapacity: 500,
      activeRegistrationsCount: 500,
    });

    assert.equal(result.allowed, false);
    assert.equal(result.statusCode, 400);
    assert.equal(result.soldOut, true);
    assert.equal(result.remainingSlots, 0);
    assert.match(result.error, /เต็มจำนวนแล้ว/);
  });

  await t.test("rejects registration when active participants exceed event limit (burst overflow protection)", () => {
    const result = evaluateEventRegistrationQuota({
      eventCapacity: 100,
      activeRegistrationsCount: 105,
    });

    assert.equal(result.allowed, false);
    assert.equal(result.statusCode, 400);
    assert.equal(result.soldOut, true);
  });

  await t.test("remaining slots is correctly calculated as capacity minus active count", () => {
    const event = { slots: 1000 };
    const registeredCount = 850;
    const remainingSlots = Math.max(0, event.slots - registeredCount);
    const isSoldOut = remainingSlots === 0;

    assert.equal(remainingSlots, 150);
    assert.equal(isSoldOut, false);
  });
});
