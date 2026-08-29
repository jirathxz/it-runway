import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

// Re-export Better Auth schema tables
export * from "./auth-schema";

// IT Runway — events in Nakhon Pathom
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  distance: text("distance").notNull(), // e.g. "5 / 10 / 21 KM"
  price: integer("price").notNull(), // 650
  status: text("status").notNull().default("open"),
  image: text("image"),
  organizerId: text("organizer_id"),
  organizerName: text("organizer_name"),
  organizerContact: text("organizer_contact"),
  approvalStatus: text("approval_status").notNull().default("approved"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// IT Runway — runner event registrations & digital BIBs
export const registrations = pgTable("registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  eventId: uuid("event_id").notNull(),
  bibNumber: text("bib_number").notNull(),
  corral: text("corral").notNull().default("CORRAL A"),
  distance: text("distance").notNull(),
  tshirtSize: text("tshirt_size").notNull().default("L"),
  status: text("status").notNull().default("upcoming"), // upcoming, completed, cancelled
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
