-- ==============================================================================
-- CAMPUS LIVE: SECURE POSTGRESQL TABLE GRANTS & RLS FOR public.activities
-- ==============================================================================
-- Principle of Least Privilege:
-- 1. RLS remains strictly ENABLED.
-- 2. Grants ONLY the required SELECT privilege to 'authenticated' and 'service_role'.
--    (No unnecessary GRANT ALL, INSERT, UPDATE, or DELETE privileges).
-- 3. No public/anonymous access is granted (table is NOT exposed to 'anon').
-- 4. RLS Policy: restricts student queries to activities that are NOT drafts,
--    cancelled, or archived, adhering strictly to real schema and status rules.
-- ==============================================================================

-- Step 1: Ensure Row Level Security is active on public.activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Step 2: Grant SELECT privilege to authenticated role (used by student Express API)
GRANT SELECT ON TABLE public.activities TO authenticated;

-- Step 3: Grant SELECT privilege to service_role (used by server backend)
GRANT SELECT ON TABLE public.activities TO service_role;

-- Step 4: Drop old or stale select policies to avoid naming collisions
DROP POLICY IF EXISTS "Students can view visible activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated users to view activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public read access to activities" ON public.activities;

-- Step 5: Enforce student visibility policy: exclude drafts, cancelled, and archived records
CREATE POLICY "Students can view visible activities"
ON public.activities
FOR SELECT
TO authenticated
USING (
  lower(status) NOT IN ('draft', 'cancelled', 'archived')
);

-- Step 6: Seed initial campus activities adhering strictly to actual schema if table is empty
INSERT INTO public.activities (
  id,
  title,
  description,
  activity_type,
  category,
  date,
  start_time,
  end_time,
  venue,
  organizer,
  department,
  max_participants,
  status
)
SELECT
  'b0000001-0000-0000-0000-000000000001'::uuid,
  'AI & Future Technology Workshop',
  'Explore emerging technologies, artificial intelligence and future innovations through an interactive campus workshop led by faculty.',
  'Workshop',
  'Workshop',
  CURRENT_DATE + INTERVAL '5 days',
  '10:00:00'::time,
  '13:00:00'::time,
  'Seminar Hall, Main Campus',
  'Department of Computer Engineering',
  'Computer Engineering',
  120,
  'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM public.activities WHERE id = 'b0000001-0000-0000-0000-000000000001'::uuid);

INSERT INTO public.activities (
  id,
  title,
  description,
  activity_type,
  category,
  date,
  start_time,
  end_time,
  venue,
  organizer,
  department,
  max_participants,
  status
)
SELECT
  'b0000002-0000-0000-0000-000000000002'::uuid,
  'Inter-College Hackathon 2026',
  'A thrilling collaborative sprint where teams engineer impactful web and mobile solutions addressing real campus sustainability challenges.',
  'Hackathon',
  'Hackathon',
  CURRENT_DATE + INTERVAL '8 days',
  '09:00:00'::time,
  '18:00:00'::time,
  'Innovation Lab',
  'Coding Club',
  'Computer Engineering',
  100,
  'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM public.activities WHERE id = 'b0000002-0000-0000-0000-000000000002'::uuid);

INSERT INTO public.activities (
  id,
  title,
  description,
  activity_type,
  category,
  date,
  start_time,
  end_time,
  venue,
  organizer,
  department,
  max_participants,
  status
)
SELECT
  'b0000003-0000-0000-0000-000000000003'::uuid,
  'Cloud Computing & DevOps Masterclass',
  'Hands-on session covering CI/CD pipelines, Docker containers, Kubernetes clustering and modern cloud architecture deployments.',
  'Technical',
  'Technical',
  CURRENT_DATE + INTERVAL '12 days',
  '14:00:00'::time,
  '17:00:00'::time,
  'Auditorium B',
  'Cloud Computing Society',
  'Information Technology',
  80,
  'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM public.activities WHERE id = 'b0000003-0000-0000-0000-000000000003'::uuid);

INSERT INTO public.activities (
  id,
  title,
  description,
  activity_type,
  category,
  date,
  start_time,
  end_time,
  venue,
  organizer,
  department,
  max_participants,
  status
)
SELECT
  'b0000004-0000-0000-0000-000000000004'::uuid,
  'Robotics & Embedded Systems Expo',
  'Interactive hardware demonstration featuring Arduino, Raspberry Pi, robotics projects, and IoT sensor networks.',
  'Competition',
  'Competition',
  CURRENT_DATE + INTERVAL '15 days',
  '11:00:00'::time,
  '16:00:00'::time,
  'Mechanical Block Workshop',
  'Robotics Club',
  'Mechanical',
  150,
  'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM public.activities WHERE id = 'b0000004-0000-0000-0000-000000000004'::uuid);

INSERT INTO public.activities (
  id,
  title,
  description,
  activity_type,
  category,
  date,
  start_time,
  end_time,
  venue,
  organizer,
  department,
  max_participants,
  status
)
SELECT
  'b0000005-0000-0000-0000-000000000005'::uuid,
  'Annual Campus Cultural Gala',
  'Vibrant musical performances, dramatic arts, dance ensembles, and artistic showcases celebrating student talent.',
  'Cultural',
  'Cultural',
  CURRENT_DATE + INTERVAL '20 days',
  '17:00:00'::time,
  '21:00:00'::time,
  'Open Air Amphitheatre',
  'Cultural Committee',
  'All Departments',
  500,
  'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM public.activities WHERE id = 'b0000005-0000-0000-0000-000000000005'::uuid);
