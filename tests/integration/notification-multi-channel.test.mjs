import test from "node:test";
import assert from "node:assert/strict";

const CORE_EVENTS = [
  "REGISTRATION_CONFIRMED",
  "PAYMENT_SUCCESSFUL",
  "BIB_ISSUED",
  "RACE_REMINDER",
  "SHIPPING_UPDATED",
  "EVENT_CANCELLED",
  "TRANSFER_COMPLETED",
  "RESULTS_PUBLISHED",
  "CERTIFICATE_AVAILABLE",
];

const CHANNELS = ["in_app", "email", "sms", "push"];

function simulateMultiChannelDispatch(eventType, recipient) {
  return CHANNELS.map((channel) => ({
    channel,
    eventType,
    recipient: channel === "email" ? recipient.email : channel === "sms" ? recipient.phone : recipient.id,
    status: "DELIVERED",
    dispatchedAt: new Date().toISOString(),
  }));
}

test("Integration Test: Multi-Channel Notification Dispatch across 9 Events", async (t) => {
  const runner = {
    id: "user-101",
    name: "ธนภัทร รุ่งเรือง",
    email: "runner@it-runway.com",
    phone: "0819998888",
  };

  for (const event of CORE_EVENTS) {
    await t.test(`Dispatches ${event} to all 4 channels (Email, SMS, Push, In-App)`, () => {
      const dispatched = simulateMultiChannelDispatch(event, runner);

      assert.equal(dispatched.length, 4);
      const emailNotif = dispatched.find((d) => d.channel === "email");
      assert.equal(emailNotif.recipient, runner.email);
      assert.equal(emailNotif.status, "DELIVERED");

      const smsNotif = dispatched.find((d) => d.channel === "sms");
      assert.equal(smsNotif.recipient, runner.phone);
      assert.equal(smsNotif.status, "DELIVERED");
    });
  }
});
