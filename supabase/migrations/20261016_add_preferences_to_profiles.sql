-- ==============================================================================
-- CAMPUS LIVE: ADD PREFERENCES JSONB TO public.profiles
-- ==============================================================================
-- Step 6: Student Settings Persistence
--
-- Objective:
-- Persist student portal preferences (notification alerts, UI appearance,
-- density, and security flags) within the existing public.profiles table.
--
-- Schema Design:
-- Adds a `preferences` JSONB column with standard default keys.
-- Preserves existing Row Level Security (RLS) policies:
-- Users can view and update their own profile row (auth.uid() = id).
--
-- NOTE: Prepared as a local migration for review. Do not run or deploy
-- directly to remote database without approval.
-- ==============================================================================

BEGIN;

-- 1. Add preferences column with default schema
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "notifications": {
    "activityAlerts": true,
    "registrationUpdates": true,
    "clubNotices": true,
    "campusAdvisories": true,
    "emailDigest": false
  },
  "appearance": {
    "theme": "light",
    "density": "comfortable"
  },
  "security": {
    "twoFactorEnabled": false
  }
}'::jsonb;

-- 2. Backfill existing profile rows where preferences is NULL
UPDATE public.profiles
SET preferences = '{
  "notifications": {
    "activityAlerts": true,
    "registrationUpdates": true,
    "clubNotices": true,
    "campusAdvisories": true,
    "emailDigest": false
  },
  "appearance": {
    "theme": "light",
    "density": "comfortable"
  },
  "security": {
    "twoFactorEnabled": false
  }
}'::jsonb
WHERE preferences IS NULL;

-- 3. Add documentation comment
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences for notification alerts, appearance theme and density, and security options.';

-- 4. Grants and column-level privileges:
-- Aligns with 20261012_hardened_security_and_registration.sql where table-level UPDATE
-- was revoked and column-level UPDATE was granted on approved editable fields.
-- Explicitly grants UPDATE on the new 'preferences' column to authenticated users.
-- Critical system fields (id, student_id, role, email, is_active, created_at) remain strictly protected.
GRANT UPDATE (preferences) ON TABLE public.profiles TO authenticated;

COMMIT;
