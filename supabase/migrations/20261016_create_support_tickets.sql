-- ==============================================================================
-- CAMPUS LIVE: LOCAL PROPOSED MIGRATION - SUPPORT TICKETS & TICKET MESSAGES
-- File: supabase/migrations/20261016_create_support_tickets.sql
-- ==============================================================================
-- NOTICE:
-- 1. LOCAL PROPOSED MIGRATION ONLY - DO NOT RUN AUTOMATICALLY ON REMOTE SUPABASE.
-- 2. Defines the minimum required tables, constraints, relationships, indexes,
--    and Row Level Security (RLS) policies for Student Support Tickets & Messages.
-- 3. Student foreign key references public.profiles(id), which matches auth.uid().
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Table: public.support_tickets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin text NOT NULL DEFAULT 'student' CHECK (origin IN ('student', 'faculty', 'public')),
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  subject text NOT NULL,
  description text NOT NULL,
  attachment_name text,
  assigned_to text DEFAULT 'Unassigned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Table: public.support_ticket_messages
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  sender_role text NOT NULL DEFAULT 'Student',
  message text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Indexes for Query Performance & Foreign Key Lookups
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_support_tickets_student_id ON public.support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON public.support_ticket_messages(created_at ASC);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- 4.1 Grants for service_role (Trusted Express Backend)
GRANT ALL ON TABLE public.support_tickets TO service_role;
GRANT ALL ON TABLE public.support_ticket_messages TO service_role;

-- 4.2 Grants for authenticated and anon roles
GRANT SELECT, INSERT ON TABLE public.support_tickets TO authenticated;
GRANT SELECT, INSERT ON TABLE public.support_ticket_messages TO authenticated;

-- Direct client UPDATE, DELETE are strictly revoked (managed via backend API)
REVOKE UPDATE, DELETE ON TABLE public.support_tickets FROM authenticated, anon, PUBLIC;
REVOKE UPDATE, DELETE ON TABLE public.support_ticket_messages FROM authenticated, anon, PUBLIC;
REVOKE ALL ON TABLE public.support_tickets FROM anon;
REVOKE ALL ON TABLE public.support_ticket_messages FROM anon;

-- 4.3 RLS Policies for public.support_tickets
DROP POLICY IF EXISTS "Students can view their own support tickets" ON public.support_tickets;
CREATE POLICY "Students can view their own support tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can create support tickets for themselves" ON public.support_tickets;
CREATE POLICY "Students can create support tickets for themselves"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- 4.4 RLS Policies for public.support_ticket_messages
DROP POLICY IF EXISTS "Students can view messages on their own tickets" ON public.support_ticket_messages;
CREATE POLICY "Students can view messages on their own tickets"
ON public.support_ticket_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = support_ticket_messages.ticket_id
    AND st.student_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Students can add messages to their own tickets" ON public.support_ticket_messages;
CREATE POLICY "Students can add messages to their own tickets"
ON public.support_ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = support_ticket_messages.ticket_id
    AND st.student_id = auth.uid()
  )
);

-- ------------------------------------------------------------------------------
-- 5. Trigger: Automatically Synchronize Ticket updated_at on Message Insertion
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_support_ticket_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE public.support_tickets
  SET updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_support_ticket_updated_at ON public.support_ticket_messages;
CREATE TRIGGER trg_sync_support_ticket_updated_at
AFTER INSERT ON public.support_ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.sync_support_ticket_updated_at();

COMMIT;
