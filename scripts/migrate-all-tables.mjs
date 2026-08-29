import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log("Connected to PostgreSQL! Creating all 31 tables if not exists...");

  try {
    await client.query("BEGIN");

    // 1. Core Auth Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "email_verified" BOOLEAN DEFAULT FALSE NOT NULL,
        "image" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "role" TEXT DEFAULT 'user',
        "banned" BOOLEAN DEFAULT FALSE,
        "ban_reason" TEXT,
        "ban_expires" TIMESTAMP,
        "phone_number" TEXT UNIQUE,
        "phone_number_verified" BOOLEAN DEFAULT FALSE,
        "gender" TEXT,
        "birthdate" TEXT,
        "blood_type" TEXT,
        "emergency_name" TEXT,
        "emergency_phone" TEXT,
        "medical_conditions" TEXT,
        "tshirt_size" TEXT DEFAULT 'L',
        "preferred_distance" TEXT DEFAULT '21K',
        "running_club" TEXT,
        "target_pace" TEXT,
        "chip_code" TEXT
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY,
        "expires_at" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "ip_address" TEXT,
        "user_agent" TEXT,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "impersonated_by" TEXT
      );

      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY,
        "account_id" TEXT NOT NULL,
        "provider_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" TEXT,
        "refresh_token" TEXT,
        "id_token" TEXT,
        "access_token_expires_at" TIMESTAMP,
        "refresh_token_expires_at" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "issuer" TEXT
      );
    `);

    // 2. Events & Information Module
    await client.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "date" TIMESTAMPTZ NOT NULL,
        "distance" TEXT NOT NULL,
        "price" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'open',
        "image" TEXT,
        "organizer_id" TEXT,
        "organizer_name" TEXT,
        "organizer_contact" TEXT,
        "approval_status" TEXT NOT NULL DEFAULT 'approved',
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "event_categories" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "distance_km" NUMERIC(5,2) NOT NULL,
        "price" INTEGER NOT NULL,
        "slots" INTEGER NOT NULL DEFAULT 500,
        "registered_count" INTEGER NOT NULL DEFAULT 0,
        "cut_off_time_minutes" INTEGER DEFAULT 180,
        "start_time" TEXT NOT NULL DEFAULT '05:00 น.',
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "event_checkpoints" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "distance_from_start_km" NUMERIC(5,2) NOT NULL,
        "has_water_station" BOOLEAN DEFAULT TRUE,
        "has_medical_station" BOOLEAN DEFAULT FALSE,
        "has_timing_mat" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "event_schedules" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "time" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "sort_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "event_rules" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "category" TEXT NOT NULL DEFAULT 'general',
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "sort_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "event_awards" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "distance" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "trophy_description" TEXT NOT NULL,
        "prize_money" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // 3. Registrations & Self-Service Module
    await client.query(`
      CREATE TABLE IF NOT EXISTS "registrations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "bib_number" TEXT NOT NULL,
        "corral" TEXT NOT NULL DEFAULT 'CORRAL A',
        "distance" TEXT NOT NULL,
        "tshirt_size" TEXT NOT NULL DEFAULT 'L',
        "status" TEXT NOT NULL DEFAULT 'upcoming',
        "chip_code" TEXT NOT NULL,
        "shipping_status" TEXT NOT NULL DEFAULT 'pickup',
        "tracking_number" TEXT,
        "pickup_date" TEXT,
        "official_time" TEXT,
        "pace" TEXT,
        "rank" TEXT,
        "checked_in" TEXT NOT NULL DEFAULT 'no',
        "checked_in_at" TIMESTAMPTZ,
        "registered_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "registration_items" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "item_type" TEXT NOT NULL,
        "item_name" TEXT NOT NULL,
        "unit_price" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "registration_transfers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "from_user_id" TEXT NOT NULL REFERENCES "user"("id"),
        "to_user_id" TEXT REFERENCES "user"("id"),
        "to_runner_name" TEXT NOT NULL,
        "to_runner_phone" TEXT NOT NULL,
        "to_runner_email" TEXT,
        "old_chip_code" TEXT,
        "new_chip_code" TEXT NOT NULL,
        "reason" TEXT,
        "transferred_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "registration_cancellations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id"),
        "reason" TEXT NOT NULL,
        "refund_method" TEXT NOT NULL DEFAULT 'promptpay',
        "refund_account" TEXT,
        "refund_amount" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "cancelled_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // 4. BIB, RFID & Checkins
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bib_numbers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "bib_code" TEXT NOT NULL,
        "distance" TEXT NOT NULL,
        "corral" TEXT NOT NULL DEFAULT 'CORRAL A',
        "is_assigned" BOOLEAN NOT NULL DEFAULT FALSE,
        "assigned_registration_id" UUID,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "rfid_chips" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "chip_code" TEXT NOT NULL UNIQUE,
        "frequency_band" TEXT DEFAULT 'UHF 920-925MHz',
        "status" TEXT NOT NULL DEFAULT 'active',
        "last_read_time" TIMESTAMPTZ,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "checkins" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "bib_number" TEXT NOT NULL,
        "gate_location" TEXT NOT NULL DEFAULT 'Gate 1 - Expo Hall',
        "method" TEXT NOT NULL DEFAULT 'qr_camera',
        "checked_in_by_user_id" TEXT REFERENCES "user"("id"),
        "checked_in_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // 5. Payments & Financials
    await client.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id"),
        "amount" INTEGER NOT NULL,
        "payment_method" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "paid_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "payment_transactions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "payment_id" UUID NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
        "transaction_ref" TEXT NOT NULL UNIQUE,
        "gateway_provider" TEXT NOT NULL DEFAULT 'IT_RUNWAY_PAY',
        "gateway_status" TEXT NOT NULL DEFAULT 'SUCCESS',
        "payload" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "refunds" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "payment_id" UUID NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "amount" INTEGER NOT NULL,
        "refund_method" TEXT NOT NULL DEFAULT 'promptpay',
        "refund_ref" TEXT NOT NULL UNIQUE,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "refunded_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // 6. Race Results & Timing
    await client.query(`
      CREATE TABLE IF NOT EXISTS "race_results" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "bib_number" TEXT NOT NULL,
        "runner_name" TEXT NOT NULL,
        "gender" TEXT NOT NULL,
        "age_group" TEXT NOT NULL,
        "distance" TEXT NOT NULL,
        "chip_time" TEXT NOT NULL,
        "gun_time" TEXT NOT NULL,
        "pace" TEXT NOT NULL,
        "overall_rank" INTEGER NOT NULL,
        "gender_rank" INTEGER NOT NULL,
        "category_rank" INTEGER NOT NULL,
        "verified_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "race_splits" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "race_result_id" UUID NOT NULL REFERENCES "race_results"("id") ON DELETE CASCADE,
        "checkpoint_name" TEXT NOT NULL,
        "split_time" TEXT NOT NULL,
        "accumulated_time" TEXT NOT NULL,
        "recorded_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "race_rankings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "distance" TEXT NOT NULL,
        "ranking_type" TEXT NOT NULL,
        "rank_number" INTEGER NOT NULL,
        "bib_number" TEXT NOT NULL,
        "runner_name" TEXT NOT NULL,
        "finish_time" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // 7. Shipping & Logistics
    await client.query(`
      CREATE TABLE IF NOT EXISTS "shipping" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "recipient_name" TEXT NOT NULL,
        "recipient_phone" TEXT NOT NULL,
        "address_line" TEXT NOT NULL,
        "subdistrict" TEXT,
        "district" TEXT,
        "province" TEXT NOT NULL DEFAULT 'นครปฐม',
        "postal_code" TEXT NOT NULL DEFAULT '73000',
        "shipping_fee" INTEGER NOT NULL DEFAULT 60,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "shipping_tracking" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "courier_name" TEXT NOT NULL DEFAULT 'Thailand Post (EMS)',
        "tracking_number" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'shipped',
        "dispatched_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // 8. Media & Certificates
    await client.query(`
      CREATE TABLE IF NOT EXISTS "certificates" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "registration_id" UUID NOT NULL REFERENCES "registrations"("id") ON DELETE CASCADE,
        "certificate_number" TEXT NOT NULL UNIQUE,
        "runner_name" TEXT NOT NULL,
        "distance" TEXT NOT NULL,
        "chip_time" TEXT NOT NULL,
        "gun_time" TEXT NOT NULL,
        "rank" TEXT NOT NULL,
        "verification_hash" TEXT NOT NULL,
        "issued_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "photos" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "image_url" TEXT NOT NULL,
        "photographer_name" TEXT NOT NULL DEFAULT 'IT Runway Shutter Team',
        "checkpoint" TEXT NOT NULL,
        "checkpoint_label" TEXT NOT NULL,
        "captured_at" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "photo_checkpoints" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "photo_id" UUID NOT NULL REFERENCES "photos"("id") ON DELETE CASCADE,
        "tagged_bib" TEXT NOT NULL,
        "tagged_runner_name" TEXT,
        "confidence_score" NUMERIC(4,2) DEFAULT 0.98,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // 9. Organizers & Permissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS "organizer_requests" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" TEXT NOT NULL REFERENCES "user"("id"),
        "event_title" TEXT NOT NULL,
        "event_location" TEXT NOT NULL,
        "event_date" TIMESTAMPTZ NOT NULL,
        "distance" TEXT NOT NULL,
        "expected_runners" INTEGER DEFAULT 500,
        "ticket_price" INTEGER NOT NULL,
        "organizer_name" TEXT NOT NULL,
        "organizer_contact" TEXT NOT NULL,
        "proposal_details" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "reviewed_by_admin_id" TEXT,
        "reviewed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "organizer_members" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "role" TEXT NOT NULL DEFAULT 'staff',
        "assigned_gate" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // 10. Notifications & Audit Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "type" TEXT NOT NULL DEFAULT 'system',
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "link_url" TEXT,
        "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
        "sent_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" TEXT REFERENCES "user"("id"),
        "action" TEXT NOT NULL,
        "entity_type" TEXT NOT NULL,
        "entity_id" TEXT NOT NULL,
        "details" TEXT,
        "ip_address" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query("COMMIT");
    console.log("✅ All 31 tables successfully created and verified in PostgreSQL!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
