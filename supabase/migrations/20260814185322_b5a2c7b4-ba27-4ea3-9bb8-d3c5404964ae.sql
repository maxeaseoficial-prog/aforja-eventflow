CREATE POLICY "Users can see their own access records" ON public.forja_event_access
    FOR SELECT TO authenticated USING (user_id = auth.uid());
    
CREATE POLICY "Admins of an event can manage access" ON public.forja_event_access
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.forja_events 
            WHERE id = forja_event_access.event_id AND created_by = auth.uid()
        )
    );
