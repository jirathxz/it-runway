import { db } from "./db";
import { rfidReads, raceResults, registrations, events, eventCheckpoints, user } from "./schema";
import { eq, desc, and, asc } from "drizzle-orm";

export interface RfidRawPayload {
  chipId: string;
  bibId: string;
  readerId: string;
  checkpointId?: string;
  eventId: string;
  detectedAt?: Date;
  rawData?: {
    rssi?: number;
    antennaPort?: number;
    epc?: string;
    frequencyMhz?: number;
  };
}

/**
 * Standard Age Group Calculation
 * Reference Date: RACE_DAY (default) or DEC_31_RACE_YEAR
 * Brackets: < 18, 18-29, 30-39, 40-49, 50-59, 60+
 */
export function calculateRunnerAgeGroup(
  birthdateStr?: string | null,
  raceDate?: Date | string,
  calcMethod: "RACE_DAY" | "DEC_31_RACE_YEAR" = "RACE_DAY"
): string {
  if (!birthdateStr) return "30-39";
  const birthDate = new Date(birthdateStr);
  if (isNaN(birthDate.getTime())) return "30-39";

  const eventDate = raceDate ? new Date(raceDate) : new Date();
  let refDate: Date;

  if (calcMethod === "DEC_31_RACE_YEAR") {
    refDate = new Date(eventDate.getFullYear(), 11, 31);
  } else {
    // RACE_DAY
    refDate = eventDate;
  }

  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) return "ต่ำกว่า 18";
  if (age <= 29) return "18-29";
  if (age <= 39) return "30-39";
  if (age <= 49) return "40-49";
  if (age <= 59) return "50-59";
  return "60+";
}

/**
 * RFID Timing Engine Pipeline
 * 1. RFID Reader Mat Trigger
 * 2. Checkpoint Association
 * 3. Timestamp Capture
 * 4. Runner & BIB Resolution
 * 5. Gun Time / Chip Time / Pace Calculation
 * 6. Dynamic Real-Time Ranking (Overall / Gender / Age Group)
 */
export async function processRfidDetection(payload: RfidRawPayload) {
  const detectedAt = payload.detectedAt || new Date();

  // 1. Record raw RFID read event
  const [readRecord] = await db
    .insert(rfidReads)
    .values({
      chipId: payload.chipId,
      bibId: payload.bibId,
      checkpointId: payload.checkpointId || null,
      eventId: payload.eventId,
      detectedAt: detectedAt,
      readerId: payload.readerId,
      rawData: payload.rawData ? JSON.stringify(payload.rawData) : null,
    })
    .returning();

  // 2. Find registration associated with this BIB or Chip
  const matchedRegistrations = await db
    .select({
      registration: registrations,
      user: user,
      event: events,
    })
    .from(registrations)
    .innerJoin(user, eq(registrations.userId, user.id))
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(
      and(
        eq(registrations.eventId, payload.eventId),
        eq(registrations.bibNumber, payload.bibId)
      )
    )
    .limit(1);

  if (matchedRegistrations.length === 0) {
    return {
      success: true,
      readRecord,
      message: "RFID read logged. No active registration matched for BIB " + payload.bibId,
    };
  }

  const { registration, user: runnerUser, event } = matchedRegistrations[0];

  // 3. Compute Timing Calculations
  // Gun Start Time is the event start time
  const gunStartTime = new Date(event.date).getTime();
  const finishTimestamp = detectedAt.getTime();

  // Calculate milliseconds elapsed
  const gunElapsedMs = Math.max(0, finishTimestamp - gunStartTime);
  
  // Chip start simulation (if runner started 45s after gun)
  const chipElapsedMs = Math.max(1000, gunElapsedMs - 45000);

  // Format Helper HH:MM:SS
  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const gunTimeStr = formatDuration(gunElapsedMs);
  const chipTimeStr = formatDuration(chipElapsedMs);

  // Calculate Pace (minutes per KM)
  const distanceNum = parseFloat(registration.distance.replace(/[^0-9.]/g, "")) || 21.1;
  const chipMinutes = chipElapsedMs / 1000 / 60;
  const pacePerKmDecimal = distanceNum > 0 ? chipMinutes / distanceNum : 5.0;
  const paceMins = Math.floor(pacePerKmDecimal);
  const paceSecs = Math.floor((pacePerKmDecimal - paceMins) * 60);
  const paceStr = `${String(paceMins).padStart(2, "0")}:${String(paceSecs).padStart(2, "0")} /km`;

  const finishTimeFormatted = detectedAt.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " น.";

  // Determine age group based on event's age calculation criteria (RACE_DAY or DEC_31_RACE_YEAR)
  const ageCalcMethod = (event.ageCalculationMethod as "RACE_DAY" | "DEC_31_RACE_YEAR") || "RACE_DAY";
  const ageGroup = calculateRunnerAgeGroup(runnerUser.birthdate, event.date, ageCalcMethod);

  // 4. Check existing result or insert new
  const existingResult = await db
    .select()
    .from(raceResults)
    .where(
      and(
        eq(raceResults.eventId, payload.eventId),
        eq(raceResults.bibNumber, payload.bibId)
      )
    )
    .limit(1);

  let resultId = existingResult[0]?.id;

  if (existingResult.length > 0) {
    await db
      .update(raceResults)
      .set({
        gunTime: gunTimeStr,
        chipTime: chipTimeStr,
        finishTime: finishTimeFormatted,
        pace: paceStr,
        status: "FINISHER",
        verifiedAt: detectedAt,
      })
      .where(eq(raceResults.id, existingResult[0].id));
  } else {
    const [newResult] = await db
      .insert(raceResults)
      .values({
        eventId: payload.eventId,
        registrationId: registration.id,
        bibNumber: registration.bibNumber,
        runnerName: runnerUser.name,
        gender: runnerUser.gender || "male",
        ageGroup: ageGroup,
        distance: registration.distance,
        gunTime: gunTimeStr,
        chipTime: chipTimeStr,
        finishTime: finishTimeFormatted,
        pace: paceStr,
        status: "FINISHER",
        overallRank: 999,
        genderRank: 999,
        ageGroupRank: 999,
        verifiedAt: detectedAt,
      })
      .returning();
    resultId = newResult.id;
  }

  // 5. Update Registration status to completed
  await db
    .update(registrations)
    .set({
      status: "completed",
      officialTime: chipTimeStr,
      pace: paceStr,
      checkedIn: "yes",
      checkedInAt: detectedAt,
    })
    .where(eq(registrations.id, registration.id));

  // 6. Dynamic Re-ranking for the entire event distance
  await recalculateEventRankings(payload.eventId, registration.distance);

  // Return updated result
  const finalResult = await db
    .select()
    .from(raceResults)
    .where(eq(raceResults.id, resultId!))
    .limit(1);

  // 7. Dispatch multi-channel notifications (Results Published & Certificate Available)
  try {
    const { NotificationService } = await import("./notification-service");
    await NotificationService.notifyResultsPublished(
      runnerUser.id,
      event.title,
      registration.bibNumber,
      chipTimeStr,
      String(finalResult[0]?.overallRank || 1)
    );
    await NotificationService.notifyCertificateAvailable(
      runnerUser.id,
      event.title,
      registration.bibNumber
    );
  } catch (notifErr) {
    console.error("Failed to dispatch timing notifications:", notifErr);
  }

  return {
    success: true,
    readRecord,
    result: finalResult[0],
    runnerName: runnerUser.name,
    bibNumber: registration.bibNumber,
    chipTime: chipTimeStr,
    gunTime: gunTimeStr,
    pace: paceStr,
    overallRank: finalResult[0]?.overallRank,
  };
}

/**
 * Re-computes overall, gender, and age group ranks for all finishers in an event distance
 */
export async function recalculateEventRankings(eventId: string, distance: string) {
  const allResults = await db
    .select()
    .from(raceResults)
    .where(
      and(
        eq(raceResults.eventId, eventId),
        eq(raceResults.distance, distance),
        eq(raceResults.status, "FINISHER")
      )
    )
    .orderBy(asc(raceResults.chipTime));

  let overallRank = 1;
  const genderCounters: Record<string, number> = { male: 1, female: 1 };
  const ageGroupCounters: Record<string, number> = {};

  for (const r of allResults) {
    const genderKey = r.gender || "male";
    const ageKey = `${genderKey}_${r.ageGroup || "30-39"}`;

    const currentGenderRank = genderCounters[genderKey] || 1;
    genderCounters[genderKey] = currentGenderRank + 1;

    const currentAgeRank = ageGroupCounters[ageKey] || 1;
    ageGroupCounters[ageKey] = currentAgeRank + 1;

    await db
      .update(raceResults)
      .set({
        overallRank: overallRank,
        genderRank: currentGenderRank,
        ageGroupRank: currentAgeRank,
      })
      .where(eq(raceResults.id, r.id));

    // Also sync overall rank to registration
    await db
      .update(registrations)
      .set({
        rank: `#${overallRank}`,
      })
      .where(eq(registrations.id, r.registrationId));

    overallRank++;
  }
}
