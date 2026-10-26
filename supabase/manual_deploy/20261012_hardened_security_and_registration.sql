-- ==============================================================================
-- CAMPUS LIVE: HARDENED PRE-DEPLOYMENT CONSOLIDATED SQL (FINAL VERIFIED)
-- File: supabase/manual_deploy/20261012_hardened_security_and_registration.sql
-- ==============================================================================
-- AUDIT & DEPLOYMENT NOTICE:
-- 1. DO NOT EXECUTE AUTOMATICALLY. This script is prepared for manual review and
--    controlled execution in the Supabase Dashboard SQL Editor upon user approval.
-- 2. Comprehensive Privilege Purge (Fixes Audited Vulnerabilities):
--    - Live verification revealed:
--      * 'authenticated' held UPDATE on 13 columns of public.profiles (including
--        protected fields: id, email, created_at, is_active).
--      * 'authenticated' held column-level and table-level INSERT/UPDATE/DELETE
--        on public.registrations (including INSERT on id, activity_id, created_at).
--    - This script explicitly purges ALL table-level and column-level privileges from
--      'authenticated', 'anon', and 'PUBLIC' across profiles, registrations, and
--      activities before granting strictly minimal, non-privileged permissions.
--    - Handles PostgreSQL's special PUBLIC grantee keyword safely (unquoted keyword
--      rather than quoted identifier "public").
-- 3. Principle of Least Privilege:
--    - 'authenticated':
--        * profiles: SELECT on table, and UPDATE ONLY on approved non-sensitive columns
--          ('full_name', 'department', 'course', 'academic_year', 'division', 'phone',
--          'social_links', 'profile_image', 'updated_at').
--          Strictly EXCLUDES 'id', 'student_id', 'role', 'email', 'is_active', 'created_at'.
--        * activities: SELECT only (governed by RLS visibility rules).
--        * registrations: SELECT only (auth.uid() = student_id).
--          Direct client INSERT, UPDATE, and DELETE are strictly REVOKED.
--    - 'service_role': Trusted backend administrative client. Granted full privileges.
--    - 'anon' & 'PUBLIC': All access to private tables strictly revoked.
-- 4. Concurrency-Safe, Atomic Registration Engine:
--    - Registration and cancellation execute exclusively via secure RPC functions:
--      * public.register_student_for_activity(UUID, UUID)
--      * public.cancel_student_registration(UUID, UUID)
--    - Enforces cryptographic caller identity (auth.uid() = p_student_id), student role check,
--      row-level locks (SELECT ... FOR UPDATE), deadline enforcement, capacity checks,
--      safe search path (pg_catalog, public, pg_temp with pg_temp strictly last),
--      and safe cancellation/reactivation under exception handling.
-- 5. Scope & Safety:
--    - 100% idempotent and non-destructive to existing data.
--    - Preserves existing activity records; seed activity inserts are intentionally omitted.
-- ==============================================================================


-- ##############################################################################
-- TRANSACTION WRAPPER: Ensures atomic, all-or-nothing execution in Supabase SQL editor
-- ##############################################################################
BEGIN;

-- ##############################################################################
-- SECTION 0: COMPREHENSIVE PRIVILEGE PURGE (TABLE & COLUMN LEVEL)
-- ##############################################################################

-- 0.1 Revoke all table-level grants from untrusted API roles and PUBLIC
REVOKE ALL ON TABLE public.profiles FROM authenticated, anon, PUBLIC;
REVOKE ALL ON TABLE public.registrations FROM authenticated, anon, PUBLIC;
REVOKE ALL ON TABLE public.activities FROM authenticated, anon, PUBLIC;

-- 0.2 Dynamically revoke any lingering column-level privileges from authenticated, anon, and PUBLIC
-- Wipes all column-level INSERT/UPDATE/DELETE/SELECT privileges previously granted.
-- Handles PostgreSQL's pseudo-role 'PUBLIC' safely as an unquoted keyword.
DO $$
DECLARE
  r RECORD;
  v_grantee text;
BEGIN
  FOR r IN (
    SELECT DISTINCT table_schema, table_name, column_name, privilege_type, grantee
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'registrations', 'activities')
      AND upper(grantee) IN ('AUTHENTICATED', 'ANON', 'PUBLIC')
  ) LOOP
    IF upper(r.grantee) = 'PUBLIC' THEN
      v_grantee := 'PUBLIC';
    ELSE
      v_grantee := quote_ident(r.grantee);
    END IF;

    EXECUTE format(
      'REVOKE %s (%I) ON TABLE %I.%I FROM %s;',
      r.privilege_type,
      r.column_name,
      r.table_schema,
      r.table_name,
      v_grantee
    );
  END LOOP;
END $$;

-- 0.3 Failsafe explicit revocation of writes on public.registrations
REVOKE INSERT, UPDATE, DELETE ON TABLE public.registrations FROM authenticated, anon, PUBLIC;


-- ##############################################################################
-- SECTION 1: PUBLIC.PROFILES HARDENED SECURITY & COLUMN-LEVEL GRANTS
-- ##############################################################################

-- 1.1 Ensure Row Level Security is active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.2 Grant full administrative access to service_role (Express backend)
GRANT ALL ON TABLE public.profiles TO service_role;

-- 1.3 Grant SELECT privilege to authenticated users (required for RLS self-read)
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- 1.4 Grant UPDATE ONLY on approved, non-sensitive profile columns
-- Sensitive and institutional identifier columns are strictly excluded:
-- Excluded: 'id', 'student_id', 'role', 'email', 'is_active', 'created_at'.
-- The schema-adaptive DO block checks which of the approved editable columns actually exist
-- in the remote schema, and grants UPDATE only on those existing columns.
DO $$
DECLARE
  v_cols text[];
  v_col_list text;
BEGIN
  SELECT array_agg(quote_ident(column_name::text))
  INTO v_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN (
      'full_name',
      'department',
      'course',
      'academic_year',
      'division',
      'phone',
      'social_links',
      'profile_image',
      'updated_at'
    );

  IF v_cols IS NOT NULL AND array_length(v_cols, 1) > 0 THEN
    v_col_list := array_to_string(v_cols, ', ');
    EXECUTE format('GRANT UPDATE (%s) ON TABLE public.profiles TO authenticated;', v_col_list);
    RAISE NOTICE 'Granted UPDATE on approved profiles columns: %', v_col_list;
  ELSE
    RAISE EXCEPTION 'No approved editable columns found on public.profiles';
  END IF;
END $$;

-- 1.5 Ensure clean, idempotent RLS policies for viewing and updating self profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ##############################################################################
-- SECTION 2: PUBLIC.ACTIVITIES HARDENED SECURITY & STATUS VISIBILITY
-- ##############################################################################

-- 2.1 Ensure Row Level Security is active
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 2.2 Grant full administrative access to service_role (Express backend)
GRANT ALL ON TABLE public.activities TO service_role;

-- 2.3 Grant SELECT privilege to authenticated and anon roles (discovery & public browsing)
GRANT SELECT ON TABLE public.activities TO authenticated, anon;

-- 2.4 Drop stale or conflicting select policies
DROP POLICY IF EXISTS "Students can view visible activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated users to view activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public read access to activities" ON public.activities;
DROP POLICY IF EXISTS "Students and public can view visible activities" ON public.activities;

-- 2.5 Enforce visibility policy: exclude drafts, cancelled, and archived records for students and public
CREATE POLICY "Students and public can view visible activities"
ON public.activities
FOR SELECT
TO authenticated, anon
USING (
  lower(status) NOT IN ('draft', 'cancelled', 'archived')
);

-- NOTE: Seed activity inserts are omitted intentionally. Existing live activity rows preserved.


-- ##############################################################################
-- SECTION 3: PUBLIC.REGISTRATIONS GRANTS, UNIQUE INDEX & SECURE WRITE LOCKDOWN
-- ##############################################################################

-- 3.1 Ensure Row Level Security is active
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3.2 Grant administrative access to service_role (Express backend)
GRANT ALL ON TABLE public.registrations TO service_role;

-- 3.3 Grant ONLY SELECT to authenticated role (viewing own registrations)
GRANT SELECT ON TABLE public.registrations TO authenticated;

-- 3.4 Explicitly ensure NO table-level or column-level writes exist for authenticated or anon
REVOKE INSERT, UPDATE, DELETE ON TABLE public.registrations FROM authenticated, anon, PUBLIC;

-- 3.5 Drop stale policies to maintain clean RLS state
DROP POLICY IF EXISTS "Students can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Students can create their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Students can update their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow authenticated read registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow service role full access" ON public.registrations;

-- 3.6 Create SELECT policy restricting students strictly to their own registrations
CREATE POLICY "Students can view their own registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- 3.7 Partial Unique Index for Active Registrations
-- Enforces at the database engine level that a student can only have ONE 'registered'
-- status record per activity at any time, while preserving historical cancelled rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_student_activity_active
ON public.registrations (student_id, activity_id)
WHERE status = 'registered';


-- ##############################################################################
-- SECTION 4: CONCURRENCY-SAFE, ATOMIC REGISTRATION FUNCTION
-- ##############################################################################

-- Features:
-- - Safe search path: pg_catalog, public, pg_temp with pg_temp strictly last.
-- - Schema-qualified object references: all tables qualified as public.<table_name>.
-- - Cryptographic caller check: asserts auth.uid() = p_student_id for authenticated callers.
-- - Rejects anonymous and unauthorized callers.
-- - Student role & profile authorization: verifies profile existence and student role before modifying data.
-- - Row lock (SELECT ... FOR UPDATE): serializes concurrent registrations on the activity.
-- - Capacity & deadline enforcement: checks activity status, deadline, and seat availability under lock.
-- - Direct active registration lookup: explicitly filters by status = 'registered'.
-- - Safe cancellation reactivation: reactivates the latest cancelled row; catches unique_violation safely.
CREATE OR REPLACE FUNCTION public.register_student_for_activity(
  p_student_id UUID,
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_student_role TEXT;
  v_activity RECORD;
  v_active_reg_id UUID;
  v_cancelled_reg_id UUID;
  v_active_count INT;
  v_reg RECORD;
BEGIN
  -- 0. Caller identity verification
  IF auth.role() = 'authenticated' THEN
    IF auth.uid() IS NULL OR auth.uid() <> p_student_id THEN
      RAISE EXCEPTION 'UNAUTHORIZED_REGISTRATION: Caller identity does not match student ID' USING ERRCODE = '42501';
    END IF;
  ELSIF auth.role() = 'service_role' OR auth.role() IS NULL THEN
    -- Trusted backend administrative execution or database superuser
    NULL;
  ELSE
    -- Rejects 'anon' and any unauthorized custom roles
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required to register' USING ERRCODE = '42501';
  END IF;

  -- 1. Student profile existence and role authorization verification
  -- Enforces student-only registration; rejects non-existent profiles or non-student roles before modifying data
  SELECT role INTO v_student_role
  FROM public.profiles
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'STUDENT_PROFILE_NOT_FOUND: User profile does not exist' USING ERRCODE = 'P0002';
  END IF;

  IF lower(COALESCE(v_student_role, '')) <> 'student' THEN
    RAISE EXCEPTION 'STUDENT_ROLE_REQUIRED: Only accounts with student role may register for activities' USING ERRCODE = '42501';
  END IF;

  -- 2. Lock the target activity row to serialize concurrent transactions for this activity
  SELECT id, status, registration_deadline, date, max_participants
  INTO v_activity
  FROM public.activities
  WHERE id = p_activity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACTIVITY_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- 3. Verify activity is open for registration
  IF lower(COALESCE(v_activity.status, '')) IN ('draft', 'cancelled', 'completed', 'archived') THEN
    RAISE EXCEPTION 'ACTIVITY_NOT_AVAILABLE' USING ERRCODE = 'P0003';
  END IF;

  -- 4. Verify registration deadline has not passed (consistent with backend: registration_deadline || date)
  IF v_activity.registration_deadline IS NOT NULL THEN
    IF v_activity.registration_deadline < now() THEN
      RAISE EXCEPTION 'REGISTRATION_DEADLINE_PASSED' USING ERRCODE = 'P0004';
    END IF;
  ELSIF v_activity.date IS NOT NULL THEN
    -- Fallback to activity date if no explicit deadline was set (closed if date has passed)
    IF v_activity.date < CURRENT_DATE THEN
      RAISE EXCEPTION 'REGISTRATION_DEADLINE_PASSED' USING ERRCODE = 'P0004';
    END IF;
  END IF;

  -- 5. Check for existing active registration for this student
  SELECT id INTO v_active_reg_id
  FROM public.registrations
  WHERE student_id = p_student_id
    AND activity_id = p_activity_id
    AND status = 'registered'
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'ALREADY_REGISTERED' USING ERRCODE = 'P0005';
  END IF;

  -- 6. Check remaining capacity (counted under the exclusive activity row lock)
  SELECT COUNT(*) INTO v_active_count
  FROM public.registrations
  WHERE activity_id = p_activity_id AND status = 'registered';

  IF v_activity.max_participants IS NOT NULL AND v_active_count >= v_activity.max_participants THEN
    RAISE EXCEPTION 'ACTIVITY_FULL' USING ERRCODE = 'P0006';
  END IF;

  -- 7. Locate any existing cancelled registration to reactivate (locked for update)
  SELECT id INTO v_cancelled_reg_id
  FROM public.registrations
  WHERE student_id = p_student_id
    AND activity_id = p_activity_id
    AND status = 'cancelled'
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  -- 8. Insert new registration or reactivate previously cancelled registration safely
  BEGIN
    IF v_cancelled_reg_id IS NOT NULL THEN
      UPDATE public.registrations
      SET status = 'registered',
          registered_at = now(),
          cancelled_at = NULL,
          updated_at = now()
      WHERE id = v_cancelled_reg_id
      RETURNING * INTO v_reg;
    ELSE
      INSERT INTO public.registrations (
        student_id,
        activity_id,
        status,
        registered_at,
        created_at,
        updated_at
      )
      VALUES (
        p_student_id,
        p_activity_id,
        'registered',
        now(),
        now(),
        now()
      )
      RETURNING * INTO v_reg;
    END IF;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'ALREADY_REGISTERED' USING ERRCODE = 'P0005';
  END;

  RETURN to_jsonb(v_reg);
END;
$$;

-- 4.1 Grant execution permissions on the registration function
REVOKE ALL ON FUNCTION public.register_student_for_activity(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_student_for_activity(UUID, UUID) TO authenticated, service_role;


-- ##############################################################################
-- SECTION 5: CONCURRENCY-SAFE, ATOMIC CANCELLATION FUNCTION
-- ##############################################################################

-- Companion function for secure registration cancellation
CREATE OR REPLACE FUNCTION public.cancel_student_registration(
  p_student_id UUID,
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_reg_id UUID;
  v_reg RECORD;
BEGIN
  -- 0. Caller identity verification
  IF auth.role() = 'authenticated' THEN
    IF auth.uid() IS NULL OR auth.uid() <> p_student_id THEN
      RAISE EXCEPTION 'UNAUTHORIZED_CANCELLATION: Caller identity does not match student ID' USING ERRCODE = '42501';
    END IF;
  ELSIF auth.role() = 'service_role' OR auth.role() IS NULL THEN
    -- Trusted backend administrative execution or database superuser
    NULL;
  ELSE
    -- Rejects 'anon' and any unauthorized custom roles
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required to cancel registration' USING ERRCODE = '42501';
  END IF;

  -- 1. Locate the active registration (locked for update to prevent concurrent race conditions)
  SELECT id INTO v_reg_id
  FROM public.registrations
  WHERE student_id = p_student_id
    AND activity_id = p_activity_id
    AND status = 'registered'
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACTIVE_REGISTRATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Mark as cancelled (never delete rows)
  UPDATE public.registrations
  SET status = 'cancelled',
      cancelled_at = now(),
      updated_at = now()
  WHERE id = v_reg_id
  RETURNING * INTO v_reg;

  RETURN to_jsonb(v_reg);
END;
$$;

-- 5.1 Grant execution permissions on the cancellation function
REVOKE ALL ON FUNCTION public.cancel_student_registration(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_student_registration(UUID, UUID) TO authenticated, service_role;

-- ##############################################################################
-- COMMIT: Atomically commit all security hardening changes
-- ##############################################################################
COMMIT;
