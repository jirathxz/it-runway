import test from "node:test";
import assert from "node:assert/strict";

// Age group bracket logic
function calculateRunnerAgeGroup(birthDateStr, referenceDateStr = null, calcMethod = "RACE_DAY") {
  if (!birthDateStr) return "OPEN";
  const birthDate = new Date(birthDateStr);
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();

  let age = 0;
  if (calcMethod === "DEC_31_RACE_YEAR") {
    age = refDate.getFullYear() - birthDate.getFullYear();
  } else {
    age = refDate.getFullYear() - birthDate.getFullYear();
    const m = refDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  if (age < 18) return "< 18";
  if (age <= 29) return "18-29";
  if (age <= 39) return "30-39";
  if (age <= 49) return "40-49";
  if (age <= 59) return "50-59";
  return "60+";
}

// Pace calculation helper
function calculatePace(durationSeconds, distanceKm) {
  if (!distanceKm || distanceKm <= 0) return "0:00";
  const paceSecondsPerKm = Math.floor(durationSeconds / distanceKm);
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = paceSecondsPerKm % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

test("Unit Test: Age Group Calculation", async (t) => {
  await t.test("should correctly classify runner under 18", () => {
    const ageGroup = calculateRunnerAgeGroup("2010-05-15", "2026-11-15", "RACE_DAY");
    assert.equal(ageGroup, "< 18");
  });

  await t.test("should correctly classify 18-29 bracket", () => {
    const ageGroup = calculateRunnerAgeGroup("2000-01-01", "2026-11-15", "RACE_DAY");
    assert.equal(ageGroup, "18-29");
  });

  await t.test("should correctly classify 30-39 bracket", () => {
    const ageGroup = calculateRunnerAgeGroup("1990-06-20", "2026-11-15", "RACE_DAY");
    assert.equal(ageGroup, "30-39");
  });

  await t.test("should correctly classify 60+ bracket", () => {
    const ageGroup = calculateRunnerAgeGroup("1960-03-10", "2026-11-15", "RACE_DAY");
    assert.equal(ageGroup, "60+");
  });

  await t.test("should support World Athletics DEC_31_RACE_YEAR standard", () => {
    const ageGroup = calculateRunnerAgeGroup("1996-12-30", "2026-02-01", "DEC_31_RACE_YEAR");
    // 2026 - 1996 = 30 -> 30-39
    assert.equal(ageGroup, "30-39");
  });
});

test("Unit Test: Timing & Pace Mathematics", async (t) => {
  await t.test("should calculate correct pace for 10km in 50 minutes", () => {
    const pace = calculatePace(3000, 10); // 3000s = 50m
    assert.equal(pace, "5:00");
  });

  await t.test("should calculate correct pace for half marathon (21.1km) in 1h 45m 30s", () => {
    const pace = calculatePace(6330, 21.1);
    assert.equal(pace, "5:00");
  });
});
