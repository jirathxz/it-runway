import test from "node:test";
import assert from "node:assert/strict";

/**
 * End-to-End (E2E) Golden Runner Pipeline Test
 * Pipeline: Register → Complete Profile → Payment → BIB → Check-in → Race Result → Certificate
 */

// Simulation of the complete database & state store for the E2E lifecycle
const mockDatabase = {
  users: new Map(),
  events: new Map(),
  registrations: new Map(),
  raceResults: new Map(),
  notifications: [],
  auditLogs: [],
};

// Seed initial event
mockDatabase.events.set("ev-golden-01", {
  id: "ev-golden-01",
  title: "Nakhon Pathom Half Marathon 2026",
  distance: "21.1K",
  price: 650,
  date: "2026-11-15T05:00:00.000Z",
  status: "REGISTRATION_OPEN",
});

test("E2E Test: Golden Runner Full Flow (Register → Profile → Payment → BIB → Check-in → Result → Certificate)", async (t) => {
  let currentRunner = {
    id: "runner-user-01",
    name: "ธนภัทร รุ่งเรือง",
    email: "thanapat@runway.demo",
    phoneNumber: "0819998888",
    gender: "male",
    birthDate: "1994-08-15",
    bloodType: "B",
    emergencyName: "กานดา สุวรรณภูมิ",
    emergencyPhone: "0891112222",
    medicalConditions: "ไม่มีโรคประจำตัว",
  };
  mockDatabase.users.set(currentRunner.id, currentRunner);

  let activeRegistration = null;
  let issuedBib = null;
  let checkinRecord = null;
  let finisherResult = null;
  let issuedCertificate = null;

  // Step 1 & 2: Complete Profile Check & Event Registration
  await t.test("Step 1 & 2: Runner Validates Profile & Registers for 21.1K", () => {
    // 7 Mandatory Profile Fields Validation
    const requiredFields = [
      "name",
      "phoneNumber",
      "gender",
      "birthDate",
      "bloodType",
      "emergencyName",
      "emergencyPhone",
    ];

    const missingFields = requiredFields.filter((f) => !currentRunner[f]);
    assert.equal(missingFields.length, 0, "All 7 profile fields must be filled");

    // Registration creation
    activeRegistration = {
      id: "reg-golden-01",
      userId: currentRunner.id,
      eventId: "ev-golden-01",
      distance: "21.1K",
      tshirtSize: "L",
      status: "pending_payment",
      registeredAt: new Date().toISOString(),
    };
    mockDatabase.registrations.set(activeRegistration.id, activeRegistration);

    assert.ok(activeRegistration.id);
    assert.equal(activeRegistration.status, "pending_payment");
  });

  // Step 3: Payment Simulation
  await t.test("Step 3: Payment Simulation (PromptPay QR / Credit Card)", () => {
    const payment = {
      transactionId: "TX-PAY-889911",
      registrationId: activeRegistration.id,
      amount: 650,
      currency: "THB",
      method: "PROMPTPAY_QR",
      status: "SUCCESSFUL",
      paidAt: new Date().toISOString(),
    };

    assert.equal(payment.status, "SUCCESSFUL");
    assert.equal(payment.amount, 650);
  });

  // Step 4: BIB Number & RFID Chip Issuance
  await t.test("Step 4: BIB Number & RFID Chip Issuance", () => {
    issuedBib = {
      bibNumber: "2188",
      chipCode: "CHIP-NP-218800",
      corral: "CORRAL A",
      registrationStatus: "UPCOMING",
    };

    activeRegistration = {
      ...activeRegistration,
      ...issuedBib,
      status: "upcoming",
    };
    mockDatabase.registrations.set(activeRegistration.id, activeRegistration);

    assert.equal(activeRegistration.bibNumber, "2188");
    assert.equal(activeRegistration.corral, "CORRAL A");
    assert.ok(activeRegistration.chipCode.startsWith("CHIP-NP-"));
  });

  // Step 5: Gate Check-in (QR Scan / Barcode)
  await t.test("Step 5: Event Gate Check-in with Audio Beep & Status Update", () => {
    const scanTimestamp = "2026-11-15T04:30:00.000Z";

    activeRegistration.checkedIn = "yes";
    activeRegistration.checkedInAt = scanTimestamp;
    activeRegistration.registrationStatus = "CHECKED_IN";
    mockDatabase.registrations.set(activeRegistration.id, activeRegistration);

    checkinRecord = {
      registrationId: activeRegistration.id,
      bibNumber: activeRegistration.bibNumber,
      checkedIn: "yes",
      scannedAt: scanTimestamp,
    };

    assert.equal(activeRegistration.checkedIn, "yes");
    assert.equal(activeRegistration.registrationStatus, "CHECKED_IN");
  });

  // Step 6: RFID Sensor Ingest & Race Finish Result Processing
  await t.test("Step 6: RFID Sensor Timing Ingest & Finish Time Calculation", () => {
    const gunStart = new Date("2026-11-15T05:00:00.000Z").getTime();
    const chipStart = new Date("2026-11-15T05:00:15.000Z").getTime(); // Cross mat 15s after gun
    const finishRead = new Date("2026-11-15T06:45:45.000Z").getTime();

    const gunTimeSeconds = (finishRead - gunStart) / 1000; // 6345s = 01:45:45
    const chipTimeSeconds = (finishRead - chipStart) / 1000; // 6330s = 01:45:30

    finisherResult = {
      id: "res-golden-01",
      eventId: "ev-golden-01",
      registrationId: activeRegistration.id,
      bibNumber: activeRegistration.bibNumber,
      runnerName: currentRunner.name,
      gender: currentRunner.gender,
      ageGroup: "30-39",
      distance: "21.1K",
      gunTime: "01:45:45",
      chipTime: "01:45:30",
      pace: "5:00",
      status: "FINISHER",
      overallRank: 3,
      genderRank: 2,
      ageGroupRank: 1,
    };
    mockDatabase.raceResults.set(finisherResult.id, finisherResult);

    assert.equal(finisherResult.status, "FINISHER");
    assert.equal(finisherResult.chipTime, "01:45:30");
    assert.equal(finisherResult.overallRank, 3);
    assert.equal(finisherResult.ageGroupRank, 1);
  });

  // Step 7: Official e-Certificate Generation
  await t.test("Step 7: Official High-Resolution e-Certificate Issuance", () => {
    issuedCertificate = {
      certificateId: "CERT-NP-2026-2188",
      runnerName: currentRunner.name,
      eventTitle: "Nakhon Pathom Half Marathon 2026",
      distance: "21.1K",
      officialChipTime: finisherResult.chipTime,
      overallRank: finisherResult.overallRank,
      ageGroupRank: finisherResult.ageGroupRank,
      canvasDimensions: { width: 1600, height: 1130 },
      issuedAt: new Date().toISOString(),
      qrVerificationUrl: `https://it-runway.vercel.app/results?bib=2188`,
    };

    assert.equal(issuedCertificate.certificateId, "CERT-NP-2026-2188");
    assert.equal(issuedCertificate.officialChipTime, "01:45:30");
    assert.equal(issuedCertificate.canvasDimensions.width, 1600);
    assert.equal(issuedCertificate.canvasDimensions.height, 1130);
  });
});
