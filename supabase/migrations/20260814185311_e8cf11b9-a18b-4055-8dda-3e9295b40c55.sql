-- Add owner column
ALTER TABLE public.forja_events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Migration for existing data: set owner to the first user found or leave null for now
-- (In a real app we'd need to know which user created what, but here we'll just enable the column)

-- Create access table
CREATE TABLE IF NOT EXISTS public.forja_event_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.forja_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'editor',
    UNIQUE(event_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.forja_event_access TO authenticated;
GRANT ALL ON public.forja_event_access TO service_role;

ALTER TABLE public.forja_event_access ENABLE ROW LEVEL SECURITY;

-- Updated policies
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.forja_events;
CREATE POLICY "Users can manage events they created or have access to" ON public.forja_events
    FOR ALL TO authenticated
    USING (
        created_by = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.forja_event_access WHERE event_id = forja_events.id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can manage responsibles" ON public.forja_responsibles;
CREATE POLICY "Users can manage responsibles of events they have access to" ON public.forja_responsibles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.forja_events 
            WHERE forja_events.id = forja_responsibles.event_id 
            AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.forja_event_access WHERE event_id = forja_events.id AND user_id = auth.uid()))
        )
    );
