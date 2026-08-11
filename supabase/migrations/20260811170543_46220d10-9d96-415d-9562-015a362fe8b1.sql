-- 1. Create app state table
CREATE TABLE public.forja_app_state (
    id TEXT PRIMARY KEY,
    state JSONB NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create history table for backups
CREATE TABLE public.forja_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id TEXT REFERENCES public.forja_app_state(id) ON DELETE CASCADE,
    state JSONB NOT NULL,
    revision INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forja_app_state TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forja_app_state TO anon;
GRANT ALL ON public.forja_app_state TO service_role;

GRANT SELECT, INSERT ON public.forja_state_history TO authenticated;
GRANT SELECT, INSERT ON public.forja_state_history TO anon;
GRANT ALL ON public.forja_state_history TO service_role;

-- 4. Enable RLS
ALTER TABLE public.forja_app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forja_state_history ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public read/write access to app state" ON public.forja_app_state FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write access to history" ON public.forja_state_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
