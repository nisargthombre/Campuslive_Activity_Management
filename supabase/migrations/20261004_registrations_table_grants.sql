-- ==============================================================================
-- CAMPUS LIVE: SECURE POSTGRESQL TABLE GRANTS, RLS, UNIQUE INDEX & ATOMIC FUNCTION
-- FOR public.registrations
-- ==============================================================================
-- Architecture & Security Constraints:
-- 1. Table-Level Grants:
--    PostgreSQL 15+ evaluates role_table_grants BEFORE Row Level Security (RLS).
--    Without explicit GRANT commands, API roles (authenticated, service_role)
--    receive error 42501 ("permission denied for table registrations").
--
-- 2. Principle of Least Privilege:
--    - 'service_role': Used by Express backend administrative client. Granted ALL.
--    - 'authenticated': Used by logged-in students. Granted SELECT, INSERT, UPDATE.
--    - 'anon': NO permissions granted (registrations are strictly private).
--
-- 3. Row Level Security (RLS) Isolation:
--    - Students can ONLY select their own registrations: (auth.uid() = student_id)
--    - Students can ONLY insert their own registrations: (auth.uid() = student_id)
--    - Students can ONLY update their own registrations: (auth.uid() = student_id)
--
-- 4. Database-Level Concurrency & Integrity:
--    - Partial Unique Index: Prevents duplicate active registrations:
--      (student_id, activity_id) WHERE status = 'registered'.
--    - Atomic Registration Function: register_student_for_activity(UUID, UUID)
--      Uses 'SELECT ... FOR UPDATE' row-locking on public.activities to serialize
--      concurrent registration attempts and mathematically prevent overbooking.
-- ==============================================================================

-- Step 1: Ensure Row Level Security is active on public.registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Step 2: Grant table privileges to service_role (Express backend administrative client)
GRANT ALL ON TABLE public.registrations TO service_role;

-- Step 3: Grant table privileges to authenticated role (logged-in students)
GRANT SELECT, INSERT, UPDATE ON TABLE public.registrations TO authenticated;

-- Step 4: Drop old or conflicting policies to ensure idempotency
DROP POLICY IF EXISTS "Students can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Students can create their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Students can update their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow authenticated read registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow service role full access" ON public.registrations;

-- Step 5: Create fine-grained Row Level Security policies
-- 5a. SELECT: Students may only view their own registration records
CREATE POLICY "Students can view their own registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- 5b. INSERT: Students may only create registrations for their own account
CREATE POLICY "Students can create their own registrations"
ON public.registrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- 5c. UPDATE: Students may only update (e.g. cancel) their own registrations
CREATE POLICY "Students can update their own registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Step 6: Create Partial Unique Index for Active Registrations
-- Prevents a student from having multiple simultaneous 'registered' records
-- for the same activity, while still allowing past 'cancelled' records.
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_student_activity_active
ON public.registrations (student_id, activity_id)
WHERE status = 'registered';

-- Step 7: Atomic Concurrency-Safe Capacity Enforcement Function
-- Uses row-level lock (FOR UPDATE) on the activity row to serialize concurrent transactions.
CREATE OR REPLACE FUNCTION public.register_student_for_activity(
  p_student_id UUID,
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_activity RECORD;
  v_existing RECORD;
  v_active_count INT;
  v_reg RECORD;
BEGIN
  -- 1. Lock the target activity row to serialize concurrent registrations for this activity
  SELECT id, status, registration_deadline, max_participants
  INTO v_activity
  FROM public.activities
  WHERE id = p_activity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACTIVITY_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Verify activity is open for registration
  IF lower(COALESCE(v_activity.status, '')) IN ('draft', 'cancelled', 'completed', 'archived') THEN
    RAISE EXCEPTION 'ACTIVITY_NOT_AVAILABLE' USING ERRCODE = 'P0003';
  END IF;

  -- 3. Verify registration deadline has not passed
  IF v_activity.registration_deadline IS NOT NULL AND v_activity.registration_deadline < now() THEN
    RAISE EXCEPTION 'REGISTRATION_DEADLINE_PASSED' USING ERRCODE = 'P0004';
  END IF;

  -- 4. Check for existing active registration for this student
  SELECT id, status INTO v_existing
  FROM public.registrations
  WHERE student_id = p_student_id AND activity_id = p_activity_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND AND v_existing.status = 'registered' THEN
    RAISE EXCEPTION 'ALREADY_REGISTERED' USING ERRCODE = 'P0005';
  END IF;

  -- 5. Check remaining capacity (counted under the row lock)
  SELECT COUNT(*) INTO v_active_count
  FROM public.registrations
  WHERE activity_id = p_activity_id AND status = 'registered';

  IF v_activity.max_participants IS NOT NULL AND v_active_count >= v_activity.max_participants THEN
    RAISE EXCEPTION 'ACTIVITY_FULL' USING ERRCODE = 'P0006';
  END IF;

  -- 6. Insert new registration or reactivate previously cancelled registration
  IF FOUND AND v_existing.status = 'cancelled' THEN
    UPDATE public.registrations
    SET status = 'registered',
        registered_at = now(),
        cancelled_at = NULL,
        updated_at = now()
    WHERE id = v_existing.id
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

  RETURN to_jsonb(v_reg);
END;
$$;

-- Step 8: Grant execution privileges on the function
GRANT EXECUTE ON FUNCTION public.register_student_for_activity(UUID, UUID) TO authenticated, service_role;
