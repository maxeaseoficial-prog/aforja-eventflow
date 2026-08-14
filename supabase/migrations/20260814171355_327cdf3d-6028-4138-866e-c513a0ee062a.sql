-- Fix overly permissive RLS policies for forja_app_state
DROP POLICY "Public read/write access to app state" ON public.forja_app_state;
DROP POLICY "Public read/write access to history" ON public.forja_state_history;

-- Restrict access to authenticated users only
-- Note: Since the app currently uses a shared 'forja-principal' ID, we'll keep it simple
-- but restrict to authenticated users as a first step.
CREATE POLICY "Authenticated users can manage app state"
ON public.forja_app_state
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage state history"
ON public.forja_state_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Revoke anon grants
REVOKE ALL ON public.forja_app_state FROM anon;
REVOKE ALL ON public.forja_state_history FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forja_app_state TO authenticated;
GRANT SELECT, INSERT ON public.forja_state_history TO authenticated;
GRANT ALL ON public.forja_app_state TO service_role;
GRANT ALL ON public.forja_state_history TO service_role;