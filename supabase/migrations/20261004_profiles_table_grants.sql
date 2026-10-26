-- ==============================================================================
-- CAMPUS LIVE: POSTGRESQL TABLE GRANTS & RLS POLICIES FOR public.profiles
-- ==============================================================================
-- Root Cause:
-- PostgreSQL throws error 42501 ("permission denied for table profiles") because
-- table-level privileges (role_table_grants) are evaluated BEFORE Row Level
-- Security (RLS). When a table is created in PostgreSQL 15+, access is not
-- granted by default to API roles unless explicitly granted:
--
-- 1. service_role: Used by the Express backend administrative client with
--    SUPABASE_SERVICE_ROLE_KEY to persist uploads and perform system updates.
--    Requires: GRANT ALL ON TABLE public.profiles TO service_role;
--
-- 2. authenticated: Used by logged-in students/faculty with JWT tokens.
--    Requires: GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
--
-- Security Integrity:
-- - RLS remains strictly ENABLED.
-- - Authenticated users are strictly restricted to auth.uid() = id.
-- - No cross-user access or public read/write is granted.
-- ==============================================================================

-- Step 1: Ensure Row Level Security remains active on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Grant table-level privileges to service_role (server backend administrative client)
GRANT ALL ON TABLE public.profiles TO service_role;

-- Step 3: Grant table-level privileges to authenticated role (logged-in students & faculty)
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

-- Step 4: Ensure RLS policy for viewing own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 5: Ensure RLS policy for updating own profile (restricts update to user's own row)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
