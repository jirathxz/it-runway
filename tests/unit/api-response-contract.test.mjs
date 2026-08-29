import test from "node:test";
import assert from "node:assert/strict";

// Simulate standard envelope creators
function apiSuccess(data = {}, status = 200) {
  return {
    status,
    body: {
      success: true,
      data,
      error: null,
    },
  };
}

function apiError(code, message, status = 400, details = null) {
  return {
    status,
    body: {
      success: false,
      data: null,
      error: {
        code,
        message,
        details,
      },
    },
  };
}

test("API Test: Standard API Envelope Contract", async (t) => {
  await t.test("Success response contains success=true, data object, and error=null", () => {
    const res = apiSuccess({ eventId: "ev-101", title: "Nakhon Pathom Marathon" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.error, null);
    assert.equal(res.body.data.eventId, "ev-101");
  });

  await t.test("Error response contains success=false, data=null, and error object with code/message", () => {
    const res = apiError("PROFILE_INCOMPLETE", "กรุณากรอกข้อมูลติดต่อฉุกเฉิน", 400, {
      missingFields: ["emergencyName", "emergencyPhone"],
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.data, null);
    assert.equal(res.body.error.code, "PROFILE_INCOMPLETE");
    assert.ok(res.body.error.details.missingFields.includes("emergencyName"));
  });

  await t.test("Supports standard HTTP Status codes (401, 403, 404, 409, 429, 500)", () => {
    const unauthorized = apiError("UNAUTHORIZED", "Not logged in", 401);
    assert.equal(unauthorized.status, 401);

    const forbidden = apiError("FORBIDDEN", "Admin access required", 403);
    assert.equal(forbidden.status, 403);

    const notFound = apiError("RESOURCE_NOT_FOUND", "BIB not found", 404);
    assert.equal(notFound.status, 404);

    const conflict = apiError("ALREADY_CHECKED_IN", "Runner already checked in", 409);
    assert.equal(conflict.status, 409);

    const rateLimited = apiError("RATE_LIMITED", "Too many requests", 429);
    assert.equal(rateLimited.status, 429);
  });
});
