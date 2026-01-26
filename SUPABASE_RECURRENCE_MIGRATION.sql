-- Migration: Add recurrence group fields to events table
-- Run this in Supabase SQL Editor

-- Add recurrence group columns
ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS "recurrence_group_id" UUID,
  ADD COLUMN IF NOT EXISTS "recurrence_frequency" TEXT,
  ADD COLUMN IF NOT EXISTS "recurrence_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "recurrence_index" INTEGER;

-- Add index for efficient group queries
CREATE INDEX IF NOT EXISTS "idx_events_recurrence_group_id"
  ON "public"."events" ("recurrence_group_id")
  WHERE "recurrence_group_id" IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "public"."events"."recurrence_group_id" IS 'UUID linking events in a recurring series';
COMMENT ON COLUMN "public"."events"."recurrence_frequency" IS 'Frequency of recurrence: none, daily, weekly';
COMMENT ON COLUMN "public"."events"."recurrence_count" IS 'Total number of events in the recurrence series';
COMMENT ON COLUMN "public"."events"."recurrence_index" IS 'Position of this event in the series (0-indexed)';
