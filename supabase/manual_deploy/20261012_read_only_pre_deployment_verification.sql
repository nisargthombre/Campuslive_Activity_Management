-- ==============================================================================
-- CAMPUS LIVE: PRE-DEPLOYMENT READ-ONLY DATABASE VERIFICATION SCRIPT
-- File: supabase/manual_deploy/20261012_read_only_pre_deployment_verification.sql
-- ==============================================================================
-- INSTRUCTIONS FOR USER:
-- 1. Open the Supabase Dashboard -> SQL Editor.
-- 2. Paste and run these queries. They are 100% READ-ONLY and will NOT modify,
--    delete, lock, or write any records, schema, or permissions.
-- 3. Review the result sets to confirm schema reality before deploying the
--    hardened security script.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- CHECK 1: CRITICAL COLUMN EXISTENCE CHECKLIST (profiles, activities, registrations)
-- ------------------------------------------------------------------------------
-- Verifies whether specific required columns exist in the remote schema.
-- Look for 'EXISTS' vs 'MISSING' in the status column.
SELECT
  t.table_name,
  c.column_name,
  CASE WHEN cols.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  COALESCE(cols.data_type, 'N/A') AS data_type,
  COALESCE(cols.is_nullable, 'N/A') AS is_nullable
FROM (
  VALUES 
    ('profiles', 'id'),
    ('profiles', 'role'),
    ('profiles', 'student_id'),
    ('profiles', 'full_name'),
    ('profiles', 'phone'),
    ('profiles', 'department'),
    ('profiles', 'course'),
    ('profiles', 'academic_year'),
    ('profiles', 'division'),
    ('profiles', 'social_links'),
    ('profiles', 'profile_image'),
    ('profiles', 'updated_at'),
    ('activities', 'id'),
    ('activities', 'status'),
    ('activities', 'date'),
    ('activities', 'registration_deadline'),
    ('activities', 'max_participants'),
    ('registrations', 'id'),
    ('registrations', 'student_id'),
    ('registrations', 'activity_id'),
    ('registrations', 'status'),
    ('registrations', 'registered_at'),
    ('registrations', 'cancelled_at'),
    ('registrations', 'created_at'),
    ('registrations', 'updated_at')
) AS c(table_name, column_name)
JOIN (VALUES ('profiles'), ('activities'), ('registrations')) AS t(table_name)
  ON t.table_name = c.table_name
LEFT JOIN information_schema.columns cols
  ON cols.table_schema = 'public'
 AND cols.table_name = c.table_name
 AND cols.column_name = c.column_name
ORDER BY t.table_name, c.column_name;


-- ------------------------------------------------------------------------------
-- CHECK 2: COMPLETE COLUMN DEFINITIONS & DATA TYPES
-- ------------------------------------------------------------------------------
-- Inspect all columns and types for profiles, activities, and registrations.
SELECT 
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'activities', 'registrations')
ORDER BY table_name, ordinal_position;


-- ------------------------------------------------------------------------------
-- CHECK 3: CURRENT TABLE-LEVEL GRANTS
-- ------------------------------------------------------------------------------
-- Inspect current privileges granted to API roles (anon, authenticated, service_role) and PUBLIC.
SELECT 
  table_name,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'activities', 'registrations')
  AND upper(grantee) IN ('ANON', 'AUTHENTICATED', 'SERVICE_ROLE', 'PUBLIC')
ORDER BY table_name, grantee, privilege_type;


-- ------------------------------------------------------------------------------
-- CHECK 4: CURRENT COLUMN-LEVEL GRANTS ON PROFILES, REGISTRATIONS & ACTIVITIES
-- ------------------------------------------------------------------------------
-- Inspect column-level privileges granted to API roles and PUBLIC across all core tables.
SELECT 
  table_name,
  column_name,
  grantee,
  privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'registrations', 'activities')
  AND upper(grantee) IN ('ANON', 'AUTHENTICATED', 'SERVICE_ROLE', 'PUBLIC')
ORDER BY table_name, column_name, grantee, privilege_type;


-- ------------------------------------------------------------------------------
-- CHECK 5: ROW LEVEL SECURITY (RLS) STATUS & EXISTING POLICIES
-- ------------------------------------------------------------------------------
-- 5A: Is RLS active on the tables?
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'activities', 'registrations');

-- 5B: What policies currently exist?
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'activities', 'registrations')
ORDER BY tablename, policyname;


-- ------------------------------------------------------------------------------
-- CHECK 6: EXISTING REGISTRATION & CANCELLATION RPC DEFINITIONS
-- ------------------------------------------------------------------------------
-- Inspect existing properties for both register_student_for_activity and cancel_student_registration.
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type,
  p.proconfig AS search_path_config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('register_student_for_activity', 'cancel_student_registration')
ORDER BY p.proname;


-- ------------------------------------------------------------------------------
-- CHECK 7: EXISTING INDEXES & DUPLICATE ACTIVE REGISTRATION CHECK
-- ------------------------------------------------------------------------------
-- 7A: Does the partial unique index already exist?
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'registrations';

-- 7B: CRITICAL: Are there duplicate active registrations that would block index creation?
-- (If this query returns rows, duplicate 'registered' records must be reconciled before indexing)
SELECT 
  student_id,
  activity_id,
  count(*) AS active_record_count,
  array_agg(id) AS registration_ids
FROM public.registrations
WHERE status = 'registered'
GROUP BY student_id, activity_id
HAVING count(*) > 1;


-- ------------------------------------------------------------------------------
-- CHECK 8: LIVE STATUS & ROLE CONVENTIONS
-- ------------------------------------------------------------------------------
-- 8A: Distinct activity statuses currently in remote database
SELECT DISTINCT status, count(*) AS count
FROM public.activities
GROUP BY status;

-- 8B: Distinct registration statuses currently in remote database
SELECT DISTINCT status, count(*) AS count
FROM public.registrations
GROUP BY status;

-- 8C: Distinct profile roles currently in remote database
SELECT DISTINCT role, count(*) AS count
FROM public.profiles
GROUP BY role;
