import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";

// Re-export Better Auth schema tables
export * from "./auth-schema";
import { user } from "./auth-schema";

// Alias users for the user table
export const users = user;

// =========================================================================
// 1. EVENTS & INFORMATION MODULE (6 tables)
// =========================================================================

// 1. events
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  distance: text("distance").notNull(), // e.g. "5 / 10 / 21 KM"
  price: integer("price").notNull(), // 650
  
  // Distinct Lifecycle Status
  eventStatus: text("event_status").notNull().default("REGISTRATION_OPEN"), // DRAFT, PENDING_APPROVAL, APPROVED, REGISTRATION_OPEN, REGISTRATION_CLOSED, RACE_DAY, RESULT_PROCESSING, COMPLETED, ARCHIVED
  approvalStatus: text("approval_status").notNull().default("APPROVED"), // PENDING, APPROVED, REJECTED
  status: text("status").notNull().default("open"), // Legacy compatibility: open, closed
  
  // Age calculation criteria
  ageCalculationMethod: text("age_calculation_method").notNull().default("RACE_DAY"), // RACE_DAY (อายุ ณ วันแข่ง) หรือ DEC_31_RACE_YEAR (อายุ ณ 31 ธ.ค. ปีที่จัดงาน)
  
  image: text("image"),
  organizerId: text("organizer_id"),
  organizerName: text("organizer_name"),
  organizerContact: text("organizer_contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. event_categories (Hierarchical Category Architecture: Event -> Distance -> Gender -> Age Groups)
export const eventCategories = pgTable("event_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Half Marathon (21.1K)", "Mini Marathon (10.5K)", "Fun Run (5K)"
  distanceKm: decimal("distance_km", { precision: 5, scale: 2 }).notNull(),
  price: integer("price").notNull(),
  slots: integer("slots").notNull().default(500),
  registeredCount: integer("registered_count").notNull().default(0),
  bibPrefix: text("bib_prefix").default("HM"), // e.g. "HM", "MN", "FR"
  bibStartNumber: integer("bib_start_number").default(1001),
  bibEndNumber: integer("bib_end_number").default(1999),
  cutOffTimeMinutes: integer("cut_off_time_minutes").default(180),
  startTime: text("start_time").notNull().default("05:00 น."),
  allowedAgeGroups: text("allowed_age_groups").default('["18-29", "30-39", "40-49", "50-59", "60+"]'), // Standard Age Groups
  genderOptions: text("gender_options").default('["male", "female"]'),
  tshirtDesignUrl: text("tshirt_design_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. event_checkpoints
export const eventCheckpoints = pgTable("event_checkpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "จุดปล่อยตัว", "กม. 5 ถนนราชดำเนิน", "เส้นชัย พระปฐมเจดีย์"
  distanceFromStartKm: decimal("distance_from_start_km", { precision: 5, scale: 2 }).notNull(),
  hasWaterStation: boolean("has_water_station").default(true),
  hasMedicalStation: boolean("has_medical_station").default(false),
  hasTimingMat: boolean("has_timing_mat").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. event_schedules
export const eventSchedules = pgTable("event_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  time: text("time").notNull(), // e.g. "04:30 น."
  title: text("title").notNull(), // e.g. "เปิดจุดรับฝากของ และวอร์มอัพ"
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. event_rules
export const eventRules = pgTable("event_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("general"), // general, timing, safety, awards
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. event_awards
export const eventAwards = pgTable("event_awards", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  distance: text("distance").notNull(), // e.g. "21.1K"
  category: text("category").notNull(), // e.g. "Overall Male 1st", "Age Group 30-39"
  trophyDescription: text("trophy_description").notNull(),
  prizeMoney: integer("prize_money").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================================================
// 2. REGISTRATIONS & SELF-SERVICE MODULE (4 tables)
// =========================================================================

// 7. registrations
export const registrations = pgTable("registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  bibNumber: text("bib_number").notNull(),
  corral: text("corral").notNull().default("CORRAL A"),
  distance: text("distance").notNull(),
  tshirtSize: text("tshirt_size").notNull().default("L"),
  
  // Clean Registration Status Separation
  registrationStatus: text("registration_status").notNull().default("UPCOMING"), // UPCOMING, CHECKED_IN, TRANSFERRED, CANCELLED, COMPLETED
  status: text("status").notNull().default("upcoming"), // Legacy compatibility: upcoming, completed, cancelled
  ageGroup: text("age_group").default("30-39"), // 18-29, 30-39, 40-49, 50-59, 60+
  
  chipCode: text("chip_code").notNull(),
  shippingStatus: text("shipping_status").notNull().default("pickup"), // delivered, pickup, completed
  trackingNumber: text("tracking_number"),
  pickupDate: text("pickup_date"),
  officialTime: text("official_time"),
  pace: text("pace"),
  rank: text("rank"),
  checkedIn: text("checked_in").notNull().default("no"), // yes, no
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. registration_items
export const registrationItems = pgTable("registration_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // race_slot, tshirt, medal_engraving, photo_package
  itemName: text("item_name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. bib_transfers (BIB_TRANSFER with complete audit history)
export const bibTransfers = pgTable("bib_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  fromUserId: text("from_user_id").notNull().references(() => user.id),
  toUserId: text("to_user_id").references(() => user.id),
  oldBib: text("old_bib").notNull(),
  newBib: text("new_bib").notNull(),
  oldChip: text("old_chip").notNull(),
  newChip: text("new_chip").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("COMPLETED"), // PENDING, COMPLETED, CANCELLED
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
});

// Alias for backwards compatibility
export const registrationTransfers = bibTransfers;

// 10. registration_cancellations
export const registrationCancellations = pgTable("registration_cancellations", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  reason: text("reason").notNull(),
  refundMethod: text("refund_method").notNull().default("promptpay"), // promptpay, bank_account
  refundAccount: text("refund_account"),
  refundAmount: integer("refund_amount").notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, rejected
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// 3. BIB, RFID & CHECK-IN MODULE (3 tables)
// =========================================================================

// 11. bib_numbers
export const bibNumbers = pgTable("bib_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  bibCode: text("bib_code").notNull(), // e.g. "1088", "2101"
  distance: text("distance").notNull(),
  corral: text("corral").notNull().default("CORRAL A"),
  isAssigned: boolean("is_assigned").notNull().default(false),
  assignedRegistrationId: uuid("assigned_registration_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. rfid_chips
export const rfidChips = pgTable("rfid_chips", {
  id: uuid("id").primaryKey().defaultRandom(),
  chipCode: text("chip_code").notNull().unique(), // e.g. "NP-TIMING-1088"
  frequencyBand: text("frequency_band").default("UHF 920-925MHz"),
  status: text("status").notNull().default("active"), // active, damaged, lost
  lastReadTime: timestamp("last_read_time", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12.1. rfid_reads (RFID Reader Ingestion Mat Stream)
export const rfidReads = pgTable("rfid_reads", {
  id: uuid("id").primaryKey().defaultRandom(),
  chipId: text("chip_id").notNull(), // RFID chip EPC code e.g. "NP-TIMING-1088"
  bibId: text("bib_id").notNull(), // Runner BIB e.g. "1088"
  checkpointId: uuid("checkpoint_id").references(() => eventCheckpoints.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  detectedAt: timestamp("detected_at", { withTimezone: true }).defaultNow().notNull(),
  readerId: text("reader_id").notNull().default("READER-FINISH-MAT-01"), // e.g. "READER-START-01", "READER-KM5-01", "READER-FINISH-01"
  rawData: text("raw_data"), // e.g. JSON string { "rssi": -62, "antenna": 2, "epc": "E2801170...", "frequency": 922.5 }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. checkins
export const checkins = pgTable("checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  bibNumber: text("bib_number").notNull(),
  gateLocation: text("gate_location").notNull().default("Gate 1 - Expo Hall"),
  method: text("method").notNull().default("qr_camera"), // qr_camera, rfid_gate, manual
  checkedInByUserId: text("checked_in_by_user_id").references(() => user.id),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// 4. PAYMENTS & FINANCIALS MODULE (3 tables)
// =========================================================================

// 14. payments
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // promptpay, credit_card, mobile_banking, wallet
  status: text("status").notNull().default("completed"), // pending, completed, failed, refunded
  paidAt: timestamp("paid_at", { withTimezone: true }).defaultNow().notNull(),
});

// 15. payment_transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  transactionRef: text("transaction_ref").notNull().unique(), // e.g. "TXN-2026-NP-998811"
  gatewayProvider: text("gateway_provider").notNull().default("IT_RUNWAY_PAY"),
  gatewayStatus: text("gateway_status").notNull().default("SUCCESS"),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 16. refunds
export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  refundMethod: text("refund_method").notNull().default("promptpay"),
  refundRef: text("refund_ref").notNull().unique(),
  status: text("status").notNull().default("completed"),
  refundedAt: timestamp("refunded_at", { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// 5. RACE RESULTS & TIMING MODULE (3 tables)
// =========================================================================

// 17. race_results
export const raceResults = pgTable("race_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  bibNumber: text("bib_number").notNull(),
  runnerName: text("runner_name").notNull(),
  gender: text("gender").notNull().default("male"),
  ageGroup: text("age_group").notNull().default("30-39"),
  distance: text("distance").notNull().default("21 KM"),
  gunTime: text("gun_time").notNull(), // e.g. "00:55:04"
  chipTime: text("chip_time").notNull(), // e.g. "00:54:12"
  finishTime: text("finish_time").notNull(), // e.g. "05:54:12 น."
  pace: text("pace").notNull(), // e.g. "05:12 /km"
  status: text("status").notNull().default("FINISHER"), // FINISHER, DNF, DNS, DQ
  overallRank: integer("overall_rank").notNull(),
  genderRank: integer("gender_rank").notNull(),
  ageGroupRank: integer("age_group_rank").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }).defaultNow().notNull(),
});

// 18. race_splits
export const raceSplits = pgTable("race_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  raceResultId: uuid("race_result_id").notNull().references(() => raceResults.id, { onDelete: "cascade" }),
  checkpointName: text("checkpoint_name").notNull(), // e.g. "KM 5", "KM 10", "KM 15", "FINISH"
  splitTime: text("split_time").notNull(),
  accumulatedTime: text("accumulated_time").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
});

// 19. race_rankings
export const raceRankings = pgTable("race_rankings", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  distance: text("distance").notNull(),
  rankingType: text("ranking_type").notNull(), // overall, gender_male, gender_female, age_group
  rankNumber: integer("rank_number").notNull(),
  bibNumber: text("bib_number").notNull(),
  runnerName: text("runner_name").notNull(),
  finishTime: text("finish_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================================================
// 6. SHIPPING & LOGISTICS MODULE (2 tables)
// =========================================================================

// 20. shipping
export const shipping = pgTable("shipping", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  addressLine: text("address_line").notNull(),
  subdistrict: text("subdistrict"),
  district: text("district"),
  province: text("province").notNull().default("นครปฐม"),
  postalCode: text("postal_code").notNull().default("73000"),
  shippingFee: integer("shipping_fee").notNull().default(60),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 21. shipping_tracking
export const shippingTracking = pgTable("shipping_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  courierName: text("courier_name").notNull().default("Thailand Post (EMS)"), // EMS, Flash, Kerry
  trackingNumber: text("tracking_number").notNull(),
  status: text("status").notNull().default("shipped"), // preparing, shipped, in_transit, delivered
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// 7. MEDIA & CERTIFICATES MODULE (3 tables)
// =========================================================================

// 22. certificates
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  certificateNumber: text("certificate_number").notNull().unique(), // e.g. "CERT-NP-2026-1088"
  runnerName: text("runner_name").notNull(),
  distance: text("distance").notNull(),
  chipTime: text("chip_time").notNull(),
  gunTime: text("gun_time").notNull(),
  rank: text("rank").notNull(),
  verificationHash: text("verification_hash").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
});

// 23. photos
export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  photographerName: text("photographer_name").notNull().default("IT Runway Shutter Team"),
  checkpoint: text("checkpoint").notNull(), // start, km5, km15, finish, medal
  checkpointLabel: text("checkpoint_label").notNull(),
  capturedAt: text("captured_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 24. photo_checkpoints
export const photoCheckpoints = pgTable("photo_checkpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  photoId: uuid("photo_id").notNull().references(() => photos.id, { onDelete: "cascade" }),
  taggedBib: text("tagged_bib").notNull(), // e.g. "1088"
  taggedRunnerName: text("tagged_runner_name"),
  confidenceScore: decimal("confidence_score", { precision: 4, scale: 2 }).default("0.98"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================================================
// 8. ORGANIZERS & PERMISSIONS MODULE (2 tables)
// =========================================================================

// 25. organizer_requests
export const organizerRequests = pgTable("organizer_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id),
  eventTitle: text("event_title").notNull(),
  eventLocation: text("event_location").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  distance: text("distance").notNull(),
  expectedRunners: integer("expected_runners").default(500),
  ticketPrice: integer("ticket_price").notNull(),
  organizerName: text("organizer_name").notNull(),
  organizerContact: text("organizer_contact").notNull(),
  proposalDetails: text("proposal_details"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedByAdminId: text("reviewed_by_admin_id"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 26. organizer_members
export const organizerMembers = pgTable("organizer_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("staff"), // lead_organizer, timing_crew, checkin_staff, medical
  assignedGate: text("assigned_gate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =========================================================================
// 9. NOTIFICATIONS & AUDIT LOGS MODULE (2 tables)
// =========================================================================

// 27. notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("system"), // registration_success, bib_assigned, transfer_alert, race_day_reminder
  title: text("title").notNull(),
  message: text("message").notNull(),
  linkUrl: text("link_url"),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
});

// 28. audit_logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id),
  action: text("action").notNull(), // CHECKIN, TRANSFER_BIB, CANCEL_REGISTRATION, APPROVE_EVENT, UPDATE_TRACKING
  entityType: text("entity_type").notNull(), // registration, event, user
  entityId: text("entity_id").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
