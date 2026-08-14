-- Migration: Separate events, teams and people for granular persistence
-- 1. Events table
CREATE TABLE public.forja_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    address TEXT,
    budget NUMERIC DEFAULT 0,
    expected_guests INTEGER DEFAULT 0,
    whatsapp TEXT,
    instagram TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. People (Responsibles) table
CREATE TABLE public.forja_responsibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.forja_events(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    role TEXT DEFAULT '—',
    area TEXT NOT NULL,
    description TEXT,
    whatsapp TEXT,
    status TEXT DEFAULT 'indefinido',
    notes TEXT,
    sector TEXT DEFAULT 'Outro',
    parent_id UUID REFERENCES public.forja_responsibles(id) ON DELETE SET NULL,
    is_leader BOOLEAN DEFAULT false,
    position_x NUMERIC DEFAULT 0,
    position_y NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS and Grants
ALTER TABLE public.forja_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forja_responsibles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.forja_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forja_responsibles TO authenticated;
GRANT ALL ON public.forja_events TO service_role;
GRANT ALL ON public.forja_responsibles TO service_role;

-- Simple policies for authenticated users (shared access for now as per current project pattern)
CREATE POLICY "Authenticated users can manage events" ON public.forja_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage responsibles" ON public.forja_responsibles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_forja_events_updated_at BEFORE UPDATE ON public.forja_events FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_forja_responsibles_updated_at BEFORE UPDATE ON public.forja_responsibles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
