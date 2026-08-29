import test from "node:test";
import assert from "node:assert/strict";

// Simulate PDPA Sanitizer
function sanitizeParticipantForOrganizer(participant, includeMedical = false) {
  const hasMedicalAlert = Boolean(
    participant.medicalConditions &&
    participant.medicalConditions.trim().length > 0 &&
    !participant.medicalConditions.includes("ไม่มี") &&
    !participant.medicalConditions.includes("ปกติ")
  );

  return {
    id: participant.id,
    bibNumber: participant.bibNumber,
    name: participant.name,
    distance: participant.distance,
    gender: participant.gender,
    phoneNumber: participant.phoneNumber,
    emergencyName: participant.emergencyName,
    emergencyPhone: participant.emergencyPhone,
    hasMedicalAlert,
    medicalConditions: includeMedical
      ? participant.medicalConditions
      : hasMedicalAlert
      ? "🔒 มีข้อมูลความเสี่ยงทางการแพทย์ (ดูได้เฉพาะทีมปฐมพยาบาล)"
      : "ปกติ / ไม่มีข้อมูลระบุ",
  };
}

test("Security & PDPA Test: Medical Data Minimization", async (t) => {
  const mockParticipant = {
    id: "user-1",
    bibNumber: "1088",
    name: "สมชาย รักสงบ",
    distance: "21.1K",
    gender: "male",
    phoneNumber: "0812345678",
    emergencyName: "สมหญิง รักสงบ",
    emergencyPhone: "0898765432",
    medicalConditions: "โรคหัวใจโต และหอบหืดรุนแรง",
  };

  await t.test("Default organizer view masks sensitive medical details and provides alert indicator", () => {
    const sanitized = sanitizeParticipantForOrganizer(mockParticipant, false);

    assert.equal(sanitized.hasMedicalAlert, true);
    assert.ok(sanitized.medicalConditions.includes("🔒"));
    assert.ok(!sanitized.medicalConditions.includes("โรคหัวใจโต")); // Actual diagnosis is hidden
  });

  await t.test("Break-glass emergency view reveals medical details when includeMedical=true", () => {
    const revealed = sanitizeParticipantForOrganizer(mockParticipant, true);

    assert.equal(revealed.hasMedicalAlert, true);
    assert.equal(revealed.medicalConditions, "โรคหัวใจโต และหอบหืดรุนแรง");
  });
});
