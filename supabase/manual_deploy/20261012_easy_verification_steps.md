# 🛡️ Campus Live: Supabase Pre-Deployment Verification Guide

> **File:** `supabase/manual_deploy/20261012_easy_verification_steps.md`  
> **Target Database:** Supabase PostgreSQL  
> **Safety Guarantee:** **100% Read-Only.** None of these queries insert, update, delete, drop, or modify any database data, tables, or permissions. You can safely run them without fear of breaking your project.

---

## 📌 How to Run These Queries in Supabase

1. Open your web browser and go to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project: **Campus Live**.
3. In the left navigation sidebar, click on **SQL Editor** (icon with `>_` or SQL terminal).
4. Click **+ New query** in the top bar.
5. Copy any of the checks below, paste it into the editor, and click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
6. Compare your results with the **"What a correct result looks like"** section for each check.

---

## 🔍 Check 1: Verify Critical Columns Exist

This check verifies whether all required columns exist in `public.profiles`, `public.activities`, and `public.registrations`.

### 📋 SQL Query to Run
```sql
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
```

### ✅ What a Correct Result Looks Like
- Most rows show `status = 'EXISTS'`.
- Core columns `id`, `role`, `student_id` in `profiles`, and `status`, `max_participants` in `activities` must show `EXISTS`.
- If `division` shows `EXISTS` or `MISSING`: **Both are OK!** Our prepared deployment script is schema-adaptive and automatically handles `division` whether it exists or not.

### ⚠️ What an Incorrect Result Means
- If `profiles.id`, `profiles.role`, `activities.id`, `activities.status`, or `registrations.status` show `MISSING`, the core database tables are incomplete or were created with different column names.

### 🛠️ What to Do If Incorrect
- If core columns like `role` or `status` are missing, stop and share the exact missing column names before deploying the script.

---

## 🔍 Check 2: Check Existing Table-Level & Column Permissions

This check inspects the permissions currently held by Supabase API roles (`anon`, `authenticated`, `service_role`).

### 📋 SQL Query to Run
```sql
SELECT 
  table_name,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'activities', 'registrations')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;
```

### ✅ What a Correct Result Looks Like
- `service_role` should have privileges (or ALL) on these tables.
- `anon` should have **no** permissions (or at most limited SELECT if public discovery was previously enabled).
- `authenticated` typically has `SELECT` or `UPDATE`.

### ⚠️ What an Incorrect Result Means
- If `anon` has `INSERT`, `UPDATE`, or `DELETE`, anonymous public users could tamper with data without logging in.
- If `authenticated` has direct `INSERT` or `UPDATE` on `registrations`, students can write directly to the database without capacity checks.

### 🛠️ What to Do If Incorrect
- No immediate worry: our deployment script (`20261012_hardened_security_and_registration.sql`) automatically revokes direct table writes (`REVOKE INSERT, UPDATE, DELETE ... FROM authenticated`) to enforce business rules via RPC.

---

## 🔍 Check 3: Check Row Level Security (RLS) Status

This check verifies whether Row Level Security is turned on for all three tables.

### 📋 SQL Query to Run
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'activities', 'registrations');
```

### ✅ What a Correct Result Looks Like
You should see 3 rows where `rls_enabled` is `true`:
| tablename | rls_enabled |
| :--- | :--- |
| `activities` | `true` |
| `profiles` | `true` |
| `registrations` | `true` |

### ⚠️ What an Incorrect Result Means
- If any table shows `rls_enabled = false`, that table is unprotected and any authenticated user could query everyone's data.

### 🛠️ What to Do If Incorrect
- The prepared deployment script has explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` commands that will activate protection.

---

## 🔍 Check 4: Check If the Registration Function Already Exists

This check checks whether `register_student_for_activity` is already installed in your remote database.

### 📋 SQL Query to Run
```sql
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
  AND p.proname = 'register_student_for_activity';
```

### ✅ What a Correct Result Looks Like
- **Case A (Fresh install):** Returns **0 rows**. This means the function has not been installed yet. The deployment script will create it.
- **Case B (Already installed):** Returns 1 row showing `arguments = p_student_id uuid, p_activity_id uuid` and `security_type = SECURITY DEFINER`.

### ⚠️ What an Incorrect Result Means
- If it shows `SECURITY INVOKER` or missing search path, an older unhardened version is running.

### 🛠️ What to Do If Incorrect
- The prepared script uses `CREATE OR REPLACE FUNCTION ...`, which cleanly updates the function in-place with the hardened security checks.

---

## 🔍 Check 5: Check for Duplicate Active Registrations

> ⚠️ **CRITICAL STEP**: The deployment script creates a partial unique index on `(student_id, activity_id)` where `status = 'registered'`. If your database already has duplicate active registrations, PostgreSQL will reject the index creation.

### 📋 SQL Query to Run
```sql
SELECT 
  student_id,
  activity_id,
  count(*) AS active_record_count,
  array_agg(id) AS registration_ids
FROM public.registrations
WHERE status = 'registered'
GROUP BY student_id, activity_id
HAVING count(*) > 1;
```

### ✅ What a Correct Result Looks Like
- **0 rows returned (Empty result set)**.
- This confirms that no student has duplicate active registrations for any activity. The unique index can be created cleanly.

### ⚠️ What an Incorrect Result Means
- If 1 or more rows are returned, it means a student currently holds two or more `'registered'` rows for the exact same activity.

### 🛠️ What to Do If Incorrect
- If any rows are returned: **Do NOT deploy the script yet.** Share the returned rows with me. We will cancel the older duplicates first so the unique index can be created without errors.

---

## 🔍 Check 6: Check Live Status and Role Conventions

This check inspects the actual status text strings and roles currently stored in the database.

### 📋 SQL Query to Run
```sql
-- 6A: Activity statuses currently in database
SELECT DISTINCT status, count(*) AS count FROM public.activities GROUP BY status;

-- 6B: Registration statuses currently in database
SELECT DISTINCT status, count(*) AS count FROM public.registrations GROUP BY status;

-- 6C: User roles currently in profiles
SELECT DISTINCT role, count(*) AS count FROM public.profiles GROUP BY role;
```

### ✅ What a Correct Result Looks Like
- **Activity statuses:** `upcoming`, `open`, `published`, etc.
- **Registration statuses:** `registered`, `cancelled`, `completed`.
- **Profile roles:** `student` (lowercase), `faculty`, `admin`.

### ⚠️ What an Incorrect Result Means
- If roles are uppercase (e.g. `'STUDENT'` or `'Student'`), or registration status is `'CONFIRMED'` instead of `'registered'`.

### 🛠️ What to Do If Incorrect
- Our hardened registration function uses `lower(COALESCE(role, '')) = 'student'`, which handles both uppercase and lowercase automatically.

---

## 🚀 Pre-Deployment Summary Checklist

Once you run the checks above, verify these three green lights:

| Item | Expected Verification Result | Status |
| :--- | :--- | :---: |
| **1. Core Columns** | Core columns (`id`, `role`, `status`) show `EXISTS` in Check 1 | ⬜ |
| **2. Duplicate Active Registrations** | Check 5 returns **0 rows (Empty)** | ⬜ |
| **3. RLS Enabled** | Check 3 shows `rls_enabled = true` for all 3 tables | ⬜ |

When these three checks are verified, you can safely deploy [`supabase/manual_deploy/20261012_hardened_security_and_registration.sql`](file:///d:/Campuslive_Activity_Management/supabase/manual_deploy/20261012_hardened_security_and_registration.sql) in the Supabase SQL Editor.
