-- ============================================================
-- LUMIERE: Signups table — tracks all user registrations
-- Run in Supabase SQL Editor on jgczbcxkrfypvatkmsys
-- ============================================================

-- Drop existing table if needed (for re-running)
DROP TABLE IF EXISTS public.signups;

CREATE TABLE public.signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.signups TO anon;
GRANT ALL ON public.signups TO authenticated;
GRANT ALL ON public.signups TO service_role;

ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can insert signups" ON public.signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated can insert signups" ON public.signups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin read signups" ON public.signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
