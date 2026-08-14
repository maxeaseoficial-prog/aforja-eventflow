ALTER TABLE public.forja_responsibles DROP CONSTRAINT IF EXISTS forja_responsibles_parent_id_fkey;
ALTER TABLE public.forja_responsibles ALTER COLUMN id SET DATA TYPE TEXT;
ALTER TABLE public.forja_responsibles ALTER COLUMN parent_id SET DATA TYPE TEXT;
ALTER TABLE public.forja_responsibles ADD CONSTRAINT forja_responsibles_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.forja_responsibles(id) ON DELETE SET NULL;
