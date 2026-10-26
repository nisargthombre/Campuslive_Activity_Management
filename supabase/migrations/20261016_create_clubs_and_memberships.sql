-- ==============================================================================
-- CAMPUS LIVE: LOCAL PROPOSED MIGRATION - CLUBS & CLUB MEMBERSHIPS
-- File: supabase/migrations/20261016_create_clubs_and_memberships.sql
-- ==============================================================================
-- NOTICE:
-- 1. LOCAL PROPOSED MIGRATION ONLY - DO NOT RUN AUTOMATICALLY ON REMOTE SUPABASE.
-- 2. Defines the minimum required tables, constraints, relationships, indexes,
--    and Row Level Security (RLS) policies for Student Clubs & Memberships.
-- 3. Profiles foreign key references public.profiles(id), which matches auth.uid().
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Table: public.clubs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  about_long text,
  faculty_coordinator text,
  faculty_department text,
  faculty_email text,
  lead_name text,
  office_room text,
  email text,
  founded integer,
  meeting_schedule text,
  venue text,
  eligibility text,
  avatar_text text,
  gradient text,
  members_count integer NOT NULL DEFAULT 0,
  activities_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Table: public.club_memberships
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.club_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'pending', 'left', 'cancelled')),
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_club_student_membership UNIQUE (club_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 3. Indexes for Query Performance & Unique Constraints
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON public.clubs(slug);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON public.clubs(status);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs(category);

CREATE INDEX IF NOT EXISTS idx_club_memberships_student ON public.club_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club ON public.club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_status ON public.club_memberships(status);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

-- 4.1 Grants for service_role (Trusted Express Backend)
GRANT ALL ON TABLE public.clubs TO service_role;
GRANT ALL ON TABLE public.club_memberships TO service_role;

-- 4.2 Grants for authenticated and anon roles
GRANT SELECT ON TABLE public.clubs TO authenticated, anon;
GRANT SELECT ON TABLE public.club_memberships TO authenticated;

-- Direct client INSERT, UPDATE, DELETE are strictly revoked (managed via backend API)
REVOKE INSERT, UPDATE, DELETE ON TABLE public.clubs FROM authenticated, anon, PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.club_memberships FROM authenticated, anon, PUBLIC;

-- 4.3 RLS Policies for public.clubs
DROP POLICY IF EXISTS "Students and public can view active clubs" ON public.clubs;
CREATE POLICY "Students and public can view active clubs"
ON public.clubs
FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- 4.4 RLS Policies for public.club_memberships
DROP POLICY IF EXISTS "Students can view their own club memberships" ON public.club_memberships;
CREATE POLICY "Students can view their own club memberships"
ON public.club_memberships
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- ------------------------------------------------------------------------------
-- 5. Seed Initial Campus Live Clubs
-- ------------------------------------------------------------------------------
INSERT INTO public.clubs (
  slug, name, category, description, about_long, faculty_coordinator,
  faculty_department, faculty_email, lead_name, office_room, email,
  founded, meeting_schedule, venue, eligibility, avatar_text, gradient, status
)
VALUES
  (
    'coding-club',
    'Coding Club',
    'Technical',
    'Premier competitive programming, web development, and open-source contribution community hosting weekly hack nights.',
    'The Coding Club is the campus hub for software engineers, algorithmic problem solvers, and open-source contributors. We host weekly coding sprints, mentor juniors in data structures and full-stack development, and organize flagship inter-college hackathons and bug-bounty competitions.',
    'Dr. Rajiv Sen (CSE)',
    'Department of Computer Science & Engineering',
    'rajiv.sen@campuslive.edu',
    'Aarav Patel (Final Year CSE)',
    'Tech Annex, Room 204 (CS Block)',
    'coding.club@campuslive.edu',
    2018,
    'Wednesdays & Fridays at 5:00 PM',
    'CS Lab 3 & Tech Annex',
    'Open to all enrolled undergraduate and postgraduate students from any department. Prior coding knowledge is welcome but not required for general members.',
    'CC',
    'from-blue-600 to-indigo-600',
    'active'
  ),
  (
    'robotics-club',
    'Robotics Club',
    'Technical',
    'Hardware hacking, micro-controllers, IoT builds, autonomous bot design, and inter-collegiate robotics competitions.',
    'Robotics Club bridges the gap between hardware mechanics and embedded intelligent software. From designing line-following rovers and aerial drones to industrial robotic arms, members gain practical workshop experience using 3D printers, micro-controllers, and sensor kits.',
    'Prof. Anita Sharma (ECE)',
    'Department of Electronics & Communication',
    'anita.sharma@campuslive.edu',
    'Rohan Mehta (3rd Year ECE)',
    'Robotics Hub, Block C (Ground Floor)',
    'robotics@campuslive.edu',
    2019,
    'Tuesdays & Thursdays at 4:30 PM',
    'Robotics & Automation Lab (Block C)',
    'Open to all students. ECE, EEE, Mechanical, and CSE students find direct curriculum alignment, but enthusiasm for hardware is the only requirement.',
    'RC',
    'from-cyan-600 to-blue-700',
    'active'
  ),
  (
    'cyber-security-club',
    'Cyber Security Club',
    'Technical',
    'Ethical hacking, Capture The Flag (CTF) tournaments, network defense, penetration testing, and cryptography workshops.',
    'Dedicated to training responsible ethical hackers and cyber-defense specialists. Members engage in live capture-the-flag competitions, study vulnerability disclosures, analyze malware reverse engineering, and audit secure web applications under supervised environments.',
    'Dr. Vikram Malhotra (IT)',
    'Department of Information Technology',
    'vikram.malhotra@campuslive.edu',
    'Simran Kaur (Final Year IT)',
    'Cyber Range Lab, Room 312',
    'cybersec@campuslive.edu',
    2020,
    'Saturdays at 2:00 PM',
    'Advanced Networking Lab',
    'Students with basic networking and operating systems knowledge. Mandatory ethics agreement required for all active participants.',
    'CS',
    'from-slate-700 to-slate-900',
    'active'
  ),
  (
    'cultural-club',
    'Cultural Club',
    'Cultural',
    'Music, classical and contemporary dance, drama, theatre productions, and annual institutional fest organizing.',
    'Cultural Club is the creative heartbeat of campus life. Bringing together vocalists, instrumentalists, choreographers, and theatrical performers, the club represents the institution at regional and national inter-university youth festivals.',
    'Dr. Meenakshi Sundaram (Humanities)',
    'Department of Humanities & Arts',
    'meenakshi.s@campuslive.edu',
    'Tanvi Deshmukh (3rd Year Architecture)',
    'Open Air Amphitheatre Green Room',
    'cultural@campuslive.edu',
    2016,
    'Daily rehearsals 5:30 PM onwards before festivals',
    'Central Auditorium & Amphitheatre',
    'All creative and performing students. Auditions held each semester for core production teams.',
    'CU',
    'from-rose-500 to-pink-600',
    'active'
  ),
  (
    'sports-club',
    'Sports Club',
    'Sports',
    'Football, cricket, basketball, badminton, table tennis, athletic tournaments, and fitness conditioning squads.',
    'Sports Club organizes intramural leagues and trains collegiate squads for university tournaments. We promote physical wellness, team discipline, and healthy sportsmanship across both indoor and outdoor sports arenas.',
    'Coach S. K. Rathore (Sports Director)',
    'Department of Physical Education & Sports',
    'sk.rathore@campuslive.edu',
    'Manish Rawat (Final Year Mech)',
    'Sports Pavilion Office',
    'sports@campuslive.edu',
    2015,
    'Morning 6:30 AM & Evening 5:00 PM practice sessions',
    'University Sports Complex & Stadium',
    'Enrolled students in good physical standing. Medical fitness clearance required for competitive squad participation.',
    'SC',
    'from-amber-500 to-orange-600',
    'active'
  ),
  (
    'photography-club',
    'Photography Club',
    'Cultural',
    'Visual storytelling, photojournalism, portraiture, street photography walks, and digital post-processing masterclasses.',
    'Photography Club captures the memorable moments, architecture, and dynamic energy of Campus Live. From film-making and photo walks around historical landmarks to Lightroom post-processing workshops, members learn the art and science of visual framing.',
    'Prof. Neelam Saxena (Media Studies)',
    'Department of Mass Communication & Media',
    'neelam.saxena@campuslive.edu',
    'Kabir Juneja (3rd Year Design)',
    'Media Studio, Room 108',
    'photography@campuslive.edu',
    2019,
    'Thursdays at 5:00 PM & Weekend photowalks',
    'Media Studio & Campus Grounds',
    'Open to all students. DSLR/Mirrorless cameras recommended for advanced tracks, but smartphone photographers are warmly welcomed.',
    'PC',
    'from-violet-600 to-purple-700',
    'active'
  ),
  (
    'ecell',
    'Entrepreneurship Cell',
    'Academic',
    'Startup incubation, founder pitch decks, seed funding mentorship, venture capital connect, and annual E-Summit.',
    'E-Cell fosters entrepreneurial spirit and disruptive innovation. We connect aspiring student founders with angel investors, intellectual property lawyers, and successful alumni entrepreneurs to turn classroom ideas into viable scalable ventures.',
    'Dr. H. P. Singhania (Management Studies)',
    'Department of Management Studies',
    'hp.singhania@campuslive.edu',
    'Aditya Singhal (Final Year MBA Tech)',
    'Incubation Center, Room 002 (BBA Block)',
    'ecell@campuslive.edu',
    2017,
    'Mondays at 5:30 PM',
    'Innovation Incubation Center',
    'Open to students with startup ideas or an interest in venture operations, finance, marketing, and business modeling.',
    'EC',
    'from-emerald-600 to-teal-700',
    'active'
  ),
  (
    'literary-society',
    'Literary & Debate Society',
    'Academic',
    'Parliamentary debating, Model UN conferences, poetry slams, creative writing circles, and literary newsletter publication.',
    'The Literary & Debate Society champions articulate discourse, critical analysis, and creative self-expression. We train students in Oxford and Parliamentary debate formats, compete in national MUNs, and publish the biannual student anthology.',
    'Prof. Elizabeth George (English Dept)',
    'Department of Languages & Literature',
    'elizabeth.george@campuslive.edu',
    'Devika Nair (3rd Year Law)',
    'Language Lab, Humanities Block',
    'literary@campuslive.edu',
    2016,
    'Tuesdays & Fridays at 5:00 PM',
    'Conference Hall B & Seminar Hall',
    'Open to all students who enjoy reading, writing, speaking, and debating on contemporary global affairs.',
    'LS',
    'from-yellow-600 to-amber-700',
    'active'
  ),
  (
    'eco-warriors-nss',
    'Eco-Warriors & NSS',
    'Social',
    'Environmental sustainability, tree plantation drives, campus e-waste recycling, community service, and rural clean-up camps.',
    'Committed to environmental conservation and grassroots social impact. We lead campus waste-segregation initiatives, conduct solar awareness workshops, and coordinate seasonal community service camps in neighboring villages under the National Service Scheme.',
    'Dr. Sunita Rao (Environmental Science)',
    'Department of Earth & Environmental Sciences',
    'sunita.rao@campuslive.edu',
    'Naveen Swamy (3rd Year Civil)',
    'NSS Office, Student Union Building',
    'ecowarriors@campuslive.edu',
    2018,
    'Wednesdays 4:30 PM & Sunday community drives',
    'Eco-Park & NSS Center',
    'Open to all socially conscious students dedicated to community outreach and environmental stewardship.',
    'EW',
    'from-teal-600 to-emerald-700',
    'active'
  ),
  (
    'astronomy-club',
    'Astronomy Club',
    'Other',
    'Telescope stargazing nights, astrophotography, astrophysics seminars, eclipses tracking, and celestial observation trips.',
    'Astronomy Club gathers stargazers, astrophysics enthusiasts, and planetary observation hobbyists. With 8-inch Schmidt-Cassegrain telescopes and lunar filters, we host open-sky observation sessions for constellations, meteor showers, and planetary oppositions.',
    'Dr. K. S. Raman (Physics Dept)',
    'Department of Applied Physics',
    'ks.raman@campuslive.edu',
    'Dhruv Kapoor (2nd Year ECE)',
    'Science Block, Room 410',
    'astronomy@campuslive.edu',
    2022,
    'Clear night skies & Alternate Saturdays 7:00 PM',
    'Science Block Terrace Observatory',
    'Open to all inquisitive minds interested in the cosmos. No prior telescope operating experience required.',
    'AC',
    'from-indigo-900 to-slate-900',
    'active'
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
