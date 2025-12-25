-- Initial schema migration

-- Enums
CREATE TYPE "task_status" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "referral_status" AS ENUM ('pending', 'completed');

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "telegram_id" bigint NOT NULL UNIQUE,
  "username" text,
  "first_name" text,
  "last_name" text,
  "credits" integer NOT NULL DEFAULT 10,
  "referral_code" text UNIQUE,
  "referred_by_user_id" integer,
  "referral_credits_earned" integer NOT NULL DEFAULT 0,
  "is_early_adopter" boolean NOT NULL DEFAULT false,
  "is_premium" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "last_activity_at" timestamp
);

-- Tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "content" text NOT NULL DEFAULT '',
  "status" "task_status" NOT NULL DEFAULT 'pending',
  "image_url" text,
  "audio_url" text,
  "video_url" text,
  "share_id" text UNIQUE,
  "is_public" boolean NOT NULL DEFAULT false,
  "view_count" integer NOT NULL DEFAULT 0,
  "generation_time_ms" integer,
  "error_message" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp
);

-- Referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" serial PRIMARY KEY,
  "referrer_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "referred_user_id" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "referral_code" text NOT NULL,
  "status" "referral_status" NOT NULL DEFAULT 'pending',
  "credited" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "credited_at" timestamp
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" serial PRIMARY KEY,
  "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
  "telegram_id" bigint NOT NULL,
  "action" text NOT NULL,
  "details" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS "users_telegram_id_idx" ON "users"("telegram_id");
CREATE INDEX IF NOT EXISTS "tasks_user_id_idx" ON "tasks"("user_id");
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks"("status");
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals"("referrer_id");
CREATE INDEX IF NOT EXISTS "activity_logs_user_id_idx" ON "activity_logs"("user_id");
